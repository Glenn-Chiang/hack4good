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
	var recipients []models.Recipient
	if err := h.DB.Preload("User").Order("id desc").Find(&recipients).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, recipients)
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
