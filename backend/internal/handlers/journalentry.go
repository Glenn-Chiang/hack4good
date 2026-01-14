package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"hack4good/internal/models"
)

type JournalHandler struct {
	DB *gorm.DB
}

type createJournalEntryRequest struct {
	RecipientID uint            `json:"recipientId" binding:"required"`
	Content     string          `json:"content" binding:"required"`
	Mood        models.MoodType `json:"mood" binding:"required,oneof=happy sad angry anxious"`
}

func (h JournalHandler) Create(c *gin.Context) {
	var req createJournalEntryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Optional: ensure recipient exists
	var recipient models.Recipient
	if err := h.DB.First(&recipient, "id = ?", req.RecipientID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "recipient not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	entry := models.JournalEntry{
		RecipientID: req.RecipientID,
		Content:     req.Content,
		Mood:        req.Mood,
	}

	if err := h.DB.Create(&entry).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, entry)
}

func (h JournalHandler) List(c *gin.Context) {
	recipientIDStr := c.Query("recipientId")

	q := h.DB.Model(&models.JournalEntry{}).Order("created_at desc")
	if recipientIDStr != "" {
		q = q.Where("recipient_id = ?", recipientIDStr)
	}

	var entries []models.JournalEntry
	if err := q.Find(&entries).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, entries)
}

func (h JournalHandler) GetByID(c *gin.Context) {
	id := c.Param("id")

	var entry models.JournalEntry
	if err := h.DB.First(&entry, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "journal entry not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, entry)
}

type updateJournalEntryRequest struct {
	// pointers so “optional” fields can be omitted safely
	Content *string          `json:"content"`
	Mood    *models.MoodType `json:"mood" binding:"omitempty,oneof=happy sad angry anxious"`
}

func (h JournalHandler) Update(c *gin.Context) {
	id := c.Param("id")

	var req updateJournalEntryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var entry models.JournalEntry
	if err := h.DB.First(&entry, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "journal entry not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if req.Content != nil {
		entry.Content = *req.Content
	}
	if req.Mood != nil {
		entry.Mood = *req.Mood
	}

	if err := h.DB.Save(&entry).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, entry)
}

func (h JournalHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	res := h.DB.Delete(&models.JournalEntry{}, "id = ?", id)
	if res.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": res.Error.Error()})
		return
	}
	if res.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "journal entry not found"})
		return
	}

	c.Status(http.StatusNoContent)
}
