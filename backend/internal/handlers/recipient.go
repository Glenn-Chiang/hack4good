package handlers

import (
	"hack4good/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type RecipientHandler struct {
	DB *gorm.DB
}

func (h RecipientHandler) List(c *gin.Context) {
	var recipients []models.Recipient
	if err := h.DB.Order("id desc").Find(&recipients).Error; err != nil {
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
