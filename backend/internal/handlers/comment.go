package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"hack4good/internal/models"
)

type CommentHandler struct {
	DB *gorm.DB
}

type createCommentRequest struct {
	JournalEntryID uint   `json:"journalEntryId" binding:"required"`
	AuthorID       uint   `json:"authorId" binding:"required"` // typically a UserID
	Content        string `json:"content" binding:"required"`
}

func (h CommentHandler) Create(c *gin.Context) {
	var req createCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Optional: ensure journal entry exists
	var entry models.JournalEntry
	if err := h.DB.First(&entry, "id = ?", req.JournalEntryID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "journal entry not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Optional: ensure author exists (User table)
	var user models.User
	if err := h.DB.First(&user, "id = ?", req.AuthorID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "author not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	comment := models.Comment{
		JournalEntryID: req.JournalEntryID,
		AuthorID:       req.AuthorID,
		Content:        req.Content,
	}

	if err := h.DB.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, comment)
}

func (h CommentHandler) List(c *gin.Context) {
	journalEntryIDStr := c.Query("journalEntryId")

	q := h.DB.Model(&models.Comment{}).Order("created_at asc")
	if journalEntryIDStr != "" {
		q = q.Where("journal_entry_id = ?", journalEntryIDStr)
	}

	var comments []models.Comment
	if err := q.Find(&comments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, comments)
}

func (h CommentHandler) GetByID(c *gin.Context) {
	id := c.Param("id")

	var comment models.Comment
	if err := h.DB.First(&comment, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "comment not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, comment)
}

type updateCommentRequest struct {
	Content *string `json:"content"`
}

func (h CommentHandler) Update(c *gin.Context) {
	id := c.Param("id")

	var req updateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var comment models.Comment
	if err := h.DB.First(&comment, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "comment not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if req.Content != nil {
		comment.Content = *req.Content
	}

	if err := h.DB.Save(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, comment)
}

func (h CommentHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	res := h.DB.Delete(&models.Comment{}, "id = ?", id)
	if res.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": res.Error.Error()})
		return
	}
	if res.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "comment not found"})
		return
	}

	c.Status(http.StatusNoContent)
}
