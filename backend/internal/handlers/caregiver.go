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

func (h CaregiverHandler) Create(c *gin.Context) {
	var req struct {
		// TODO:
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	u := models.Caregiver{
		// TODO:
	}
	if err := h.DB.Create(&u).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, u)
}

func (h CaregiverHandler) List(c *gin.Context) {
	var caregivers []models.Caregiver
	if err := h.DB.Order("id desc").Find(&caregivers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, caregivers)
}
