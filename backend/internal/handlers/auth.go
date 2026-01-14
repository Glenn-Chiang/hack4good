package handlers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"hack4good/internal/auth"
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

type loginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required,min=8"`
}

type loginResponse struct {
	Token string     `json:"token"`
	User  userPublic `json:"user"`
}

// Public view of user object
type userPublic struct {
	ID       uint            `json:"id"`
	Username string          `json:"username"`
	Name     string          `json:"name"`
	Role     models.UserRole `json:"role"`
}

func (h AuthHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	username := strings.ToLower(strings.TrimSpace(req.Username))

	var u models.User
	if err := h.DB.First(&u, "username = ?", username).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid username or password"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid username or password"})
		return
	}

	token, err := auth.SignToken(u.ID, string(u.Role))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not sign token"})
		return
	}

	c.JSON(http.StatusOK, loginResponse{
		Token: token,
		User: userPublic{
			ID: u.ID, Username: u.Username, Name: u.Name, Role: u.Role,
		},
	})
}