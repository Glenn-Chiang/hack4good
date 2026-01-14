package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"hack4good/internal/models"
)

type TodoHandler struct {
	DB *gorm.DB
}

type createTodoRequest struct {
	Title       string              `json:"title" binding:"required"`
	Description string              `json:"description" binding:"required"`
	DueDate     string              `json:"dueDate" binding:"required"` // RFC3339
	RecipientID uint                `json:"recipientId" binding:"required"`
	CaregiverID uint                `json:"caregiverId" binding:"required"`
	Priority    models.TodoPriority `json:"priority" binding:"required,oneof=low medium high"`
}

func (h TodoHandler) Create(c *gin.Context) {
	var req createTodoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	due, err := parseDate(req.DueDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid dueDate; must be RFC3339"})
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

	// Optional: ensure caregiver exists
	var caregiver models.Caregiver
	if err := h.DB.First(&caregiver, "id = ?", req.CaregiverID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "caregiver not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	todo := models.Todo{
		Title:       req.Title,
		Description: req.Description,
		DueDate:     due,
		Completed:   false,
		RecipientID: req.RecipientID,
		CaregiverID: req.CaregiverID,
		Priority:    req.Priority,
	}

	if err := h.DB.Create(&todo).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, todo)
}

func (h TodoHandler) List(c *gin.Context) {
	recipientID := c.Query("recipientId")
	caregiverID := c.Query("caregiverId")
	priority := c.Query("priority")
	completed := c.Query("completed")

	q := h.DB.Model(&models.Todo{}).Order("due_date asc")

	if recipientID != "" {
		q = q.Where("recipient_id = ?", recipientID)
	}
	if caregiverID != "" {
		q = q.Where("caregiver_id = ?", caregiverID)
	}
	if priority != "" {
		q = q.Where("priority = ?", priority)
	}
	if completed != "" {
		q = q.Where("completed = ?", completed) // expects true/false
	}

	var todos []models.Todo
	if err := q.Find(&todos).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, todos)
}

func (h TodoHandler) GetByID(c *gin.Context) {
	id := c.Param("id")

	var todo models.Todo
	if err := h.DB.First(&todo, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "todo not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, todo)
}

type updateTodoRequest struct {
	Title       *string              `json:"title"`
	Description *string              `json:"description"`
	DueDate     *string              `json:"dueDate"` // RFC3339
	Completed   *bool                `json:"completed"`
	Priority    *models.TodoPriority `json:"priority" binding:"omitempty,oneof=low medium high"`
}

func (h TodoHandler) Update(c *gin.Context) {
	id := c.Param("id")

	var req updateTodoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var todo models.Todo
	if err := h.DB.First(&todo, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "todo not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if req.Title != nil {
		todo.Title = *req.Title
	}
	if req.Description != nil {
		todo.Description = *req.Description
	}
	if req.DueDate != nil {
		due, err := parseDate(*req.DueDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid dueDate; must be RFC3339"})
			return
		}
		todo.DueDate = due
	}
	if req.Completed != nil {
		todo.Completed = *req.Completed
	}
	if req.Priority != nil {
		todo.Priority = *req.Priority
	}

	if err := h.DB.Save(&todo).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, todo)
}

func (h TodoHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	res := h.DB.Delete(&models.Todo{}, "id = ?", id)
	if res.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": res.Error.Error()})
		return
	}
	if res.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "todo not found"})
		return
	}

	c.Status(http.StatusNoContent)
}
