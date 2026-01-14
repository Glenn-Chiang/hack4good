package handlers

import (
	"hack4good/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CaregiverHandler struct {
	DB *gorm.DB
}

func (h CaregiverHandler) List(c *gin.Context) {
	var caregivers []models.Caregiver
	if err := h.DB.Order("id desc").Find(&caregivers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, caregivers)
}
