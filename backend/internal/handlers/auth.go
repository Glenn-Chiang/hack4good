package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"hack4good/internal/models"
)

type SignupRequest struct {
	Username string          `json:"username" binding:"required,username"`
	Name  string          `json:"name" binding:"required"`
	Role  models.UserRole `json:"role" binding:"required,oneof=caregiver recipient"`

	Caregiver *struct {
		// caregiver-specific fields go here later
	} `json:"caregiver,omitempty"`

	Recipient *struct {
		Age       *int    `json:"age,omitempty"`
		Condition *string `json:"condition,omitempty"`
		Likes     *string `json:"likes,omitempty"`
		Dislikes  *string `json:"dislikes,omitempty"`
		Phobias   *string `json:"phobias,omitempty"`
		PetPeeves *string `json:"petPeeves,omitempty"`
	} `json:"recipient,omitempty"`
}

type AuthHandler struct {
	DB *gorm.DB
}

func (h AuthHandler) Signup(c *gin.Context) {
	var req SignupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Enforce shape based on role
	switch req.Role {
	case models.RoleCaregiver:
		if req.Caregiver == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "caregiver object is required when role is caregiver"})
			return
		}
		if req.Recipient != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "recipient object must not be provided when role is caregiver"})
			return
		}
	case models.RoleRecipient:
		if req.Recipient == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "recipient object is required when role is recipient"})
			return
		}
		if req.Caregiver != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "caregiver object must not be provided when role is recipient"})
			return
		}
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid role"})
		return
	}

	var createdUser models.User
	err := h.DB.Transaction(func(tx *gorm.DB) error {
		// 1) create user
		user := models.User{
			Username: req.Username,
			Name:  req.Name,
			Role:  req.Role,
		}
		if err := tx.Create(&user).Error; err != nil {
			return err
		}

		// 2) create role-specific profile
		if req.Role == models.RoleCaregiver {
			caregiver := models.Caregiver{UserID: user.ID}
			if err := tx.Create(&caregiver).Error; err != nil {
				return err
			}
		} else {
			recipient := models.Recipient{
				UserID:    user.ID,
				Age:       req.Recipient.Age,
				Condition: req.Recipient.Condition,
				Likes:     req.Recipient.Likes,
				Dislikes:  req.Recipient.Dislikes,
				Phobias:   req.Recipient.Phobias,
				PetPeeves: req.Recipient.PetPeeves,
			}
			if err := tx.Create(&recipient).Error; err != nil {
				return err
			}
		}

		createdUser = user
		return nil
	})

	if err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, gin.H{"error": "username already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, createdUser)
}

