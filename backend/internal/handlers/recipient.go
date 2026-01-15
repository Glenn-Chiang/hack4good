package handlers

import (
	"hack4good/internal/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type RecipientHandler struct {
	DB *gorm.DB
}

func (h RecipientHandler) List(c *gin.Context) {
	caregiverIDStr := c.Query("caregiverId")

	if caregiverIDStr == "" {
		var recipients []models.Recipient
		if err := h.DB.Preload("User").Order("id desc").Find(&recipients).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, recipients)
		return
	}

	caregiverID64, err := strconv.ParseUint(caregiverIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid caregiverId"})
		return
	}
	caregiverID := uint(caregiverID64)

	type row struct {
		RecipientID uint

		UserID   uint
		Username string
		Name     string

		Age       *int
		Condition *string
		Likes     *string
		Dislikes  *string
		Phobias   *string
		PetPeeves *string

		RequestID     *uint
		RequestStatus *string
	}

	var rows []row
	q := h.DB.Table("recipients r").
		Select(`
			r.id as recipient_id,
			u.id as user_id,
			u.username as username,
			u.name as name,
			r.age as age,
			r.condition as condition,
			r.likes as likes,
			r.dislikes as dislikes,
			r.phobias as phobias,
			r.pet_peeves as pet_peeves,
			cr.id as request_id,
			cr.status as request_status
		`).
		Joins("JOIN users u ON u.id = r.user_id").
		Joins("LEFT JOIN care_requests cr ON cr.recipient_id = r.id AND cr.caregiver_id = ?", caregiverID).
		Order("r.id desc")

	if err := q.Scan(&rows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	res := make([]models.RecipientWithRequest, 0, len(rows))
	for _, row := range rows {
		recipientWithRequest := models.RecipientWithRequest{
			Recipient: models.Recipient{
				ID:     row.RecipientID,
				UserID: row.UserID,
				User: models.User{
					ID:       row.UserID,
					Username: row.Username,
					Name:     row.Name,
				},
				Age:       row.Age,
				Condition: row.Condition,
				Likes:     row.Likes,
				Dislikes:  row.Dislikes,
				Phobias:   row.Phobias,
				PetPeeves: row.PetPeeves,
			},
			RequestID:     row.RequestID,
			RequestStatus: (*models.CareRequestStatus)(row.RequestStatus),
		}
		res = append(res, recipientWithRequest)
	}

	c.JSON(http.StatusOK, res)
}

func (h RecipientHandler) ListRecipientsByCaregiver(c *gin.Context) {
	caregiverID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid caregiver id"})
		return
	}

	var recipients []models.Recipient

	err = h.DB.
		Preload("User").
		Table("recipients").
		Joins("JOIN caregiver_recipients cr ON cr.recipient_id = recipients.id").
		Where("cr.caregiver_id = ?", uint(caregiverID)).
		Order("recipients.id asc").
		Find(&recipients).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, recipients)
}

func (h RecipientHandler) GetByID(c *gin.Context) {
	id := c.Param("recipientId")
	var recipient models.Recipient
	if err := h.DB.Where("id = ?", id).First(&recipient).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Recipient not found"})
		return
	}
	c.JSON(http.StatusOK, recipient)
}

func (h RecipientHandler) GetByUserID(c *gin.Context) {
	userID64, err := strconv.ParseUint(c.Param("userId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}
	userID := uint(userID64)

	var recipient models.Recipient
	if err := h.DB.Preload("User").First(&recipient, "user_id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "recipient not found"})
		return
	}

	c.JSON(http.StatusOK, recipient)
}
