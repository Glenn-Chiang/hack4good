package handlers

import (
	"errors"
	"fmt"
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
	Mood        models.MoodType `json:"mood" binding:"required,oneof=happy sad neutral excited angry anxious"`
}

func (h JournalHandler) Create(c *gin.Context) {

	var req createJournalEntryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Ensure recipient exists
	var recipient models.Recipient
	if err := h.DB.First(&recipient, req.RecipientID).Error; err != nil {
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
	if recipientIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "recipientId is required"})
		return
	}

	var recipientID uint
	if _, err := fmt.Sscan(recipientIDStr, &recipientID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid recipientId"})
		return
	}

	var entries []models.JournalEntry
	if err := h.DB.
		Where("recipient_id = ?", recipientID).
		Order("created_at DESC").
		Find(&entries).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, entries)
}

func (h JournalHandler) ListAccepted(c *gin.Context) {
	caregiverIDStr := c.Query("caregiverId")
	if caregiverIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "caregiverId is required"})
		return
	}

	var caregiverID uint
	if _, err := fmt.Sscan(caregiverIDStr, &caregiverID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid caregiverId"})
		return
	}

	var entries []models.JournalEntry
	if err := h.DB.
		Joins("JOIN caregiver_recipients ON caregiver_recipients.recipient_id = journal_entries.recipient_id").
		Where("caregiver_recipients.caregiver_id = ?", caregiverID).
		Order("journal_entries.created_at DESC").
		Find(&entries).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, entries)
}

type updateJournalEntryRequest struct {
	Content *string          `json:"content"`
	Mood    *models.MoodType `json:"mood" binding:"omitempty,oneof=happy sad angry anxious"`
}

func (h JournalHandler) Update(c *gin.Context) {
	idStr := c.Param("id")

	var id uint
	if _, err := fmt.Sscan(idStr, &id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid journal entry id"})
		return
	}

	var req updateJournalEntryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Content == nil && req.Mood == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "at least one field must be provided",
		})
		return
	}

	var entry models.JournalEntry
	if err := h.DB.First(&entry, id).Error; err != nil {
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
	idStr := c.Param("id")

	var id uint
	if _, err := fmt.Sscan(idStr, &id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid journal entry id"})
		return
	}

	res := h.DB.Delete(&models.JournalEntry{}, id)
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
