package handlers

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"hack4good/internal/models"
)

type CareRequestHandler struct {
	DB *gorm.DB
}

type createRequestBody struct {
	CaregiverID uint `json:"caregiverId" binding:"required"`
	RecipientID uint `json:"recipientId" binding:"required"`
}

func (h CareRequestHandler) CreateRequest(c *gin.Context) {
	var body createRequestBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate caregiver/recipient exist
	if err := h.DB.First(&models.Caregiver{}, "id = ?", body.CaregiverID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "caregiver not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if err := h.DB.First(&models.Recipient{}, "id = ?", body.RecipientID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "recipient not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// If already linked, no need to request
	var existingLink models.CaregiverRecipient
	if err := h.DB.
		Where("caregiver_id = ? AND recipient_id = ?", body.CaregiverID, body.RecipientID).
		First(&existingLink).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "caregiver and recipient already linked"})
		return
	} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// If there is already a pending request, block duplicates
	var existingReq models.CareRequest
	err := h.DB.
		Where("caregiver_id = ? AND recipient_id = ? AND status = ?", body.CaregiverID, body.RecipientID, models.CareRequestPending).
		First(&existingReq).Error
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "request already pending"})
		return
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	req := models.CareRequest{
		CaregiverID: body.CaregiverID,
		RecipientID: body.RecipientID,
		Status:      models.CareRequestPending,
	}

	if err := h.DB.Create(&req).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, req)
}

func (h CareRequestHandler) ListRecipientRequests(c *gin.Context) {
	recipientID64, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid recipient id"})
		return
	}
	recipientID := uint(recipientID64)

	status := strings.ToLower(strings.TrimSpace(c.Query("status")))

	q := h.DB.Model(&models.CareRequest{}).Where("recipient_id = ?", recipientID).Order("created_at desc")
	if status != "" {
		switch models.CareRequestStatus(status) {
		case models.CareRequestPending, models.CareRequestAccepted, models.CareRequestRejected:
			q = q.Where("status = ?", status)
		default:
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid status"})
			return
		}
	}

	var requests []models.CareRequest
	if err := q.Find(&requests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, requests)
}

type respondBody struct {
	Status string `json:"status" binding:"required,oneof=accepted rejected"`
}

func (h CareRequestHandler) RespondToRequest(c *gin.Context) {
	reqID64, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request id"})
		return
	}
	reqID := uint(reqID64)

	var body respondBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var req models.CareRequest
	if err := h.DB.First(&req, "id = ?", reqID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "request not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Only pending requests can be responded to
	if req.Status != models.CareRequestPending {
		c.JSON(http.StatusConflict, gin.H{"error": "request already responded to"})
		return
	}

	newStatus := models.CareRequestStatus(body.Status)

	err = h.DB.Transaction(func(tx *gorm.DB) error {
		// Update request status
		if err := tx.Model(&models.CareRequest{}).
			Where("id = ? AND status = ?", req.ID, models.CareRequestPending).
			Update("status", newStatus).Error; err != nil {
			return err
		}

		// If accepted, create caregiver<->recipient link (idempotent)
		if newStatus == models.CareRequestAccepted {
			link := models.CaregiverRecipient{
				CaregiverID: req.CaregiverID,
				RecipientID: req.RecipientID,
			}
			if err := tx.FirstOrCreate(
				&link,
				"caregiver_id = ? AND recipient_id = ?",
				req.CaregiverID, req.RecipientID,
			).Error; err != nil {
				return err
			}
		}
		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return updated request
	if err := h.DB.First(&req, "id = ?", reqID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, req)
}
