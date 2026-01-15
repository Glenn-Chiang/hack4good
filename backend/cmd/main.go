package main

import (
	"hack4good/internal/db"
	"hack4good/internal/handlers"
	"hack4good/internal/models"
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	DB := db.Connect()

	if err := DB.AutoMigrate(
		&models.User{},
		&models.Caregiver{},
		&models.Recipient{},
		&models.CaregiverRecipient{},
		&models.JournalEntry{},
		&models.Comment{},
		&models.Todo{},
	); err != nil {
		log.Fatalf("migrate failed: %v", err)
	}

	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	authHandler := handlers.AuthHandler{DB: DB}
	r.POST("/login", authHandler.Login)
	r.POST("/signup", authHandler.Signup)

	recipientHandler := handlers.RecipientHandler{DB: DB}
	r.GET("/recipients", recipientHandler.List)
	r.GET("/caregivers/:id/recipients", recipientHandler.ListRecipientsByCaregiver)
	r.GET("/recipients/:id", recipientHandler.GetByID)

	caregiverHandler := handlers.CaregiverHandler{DB: DB}
	r.GET("/caregivers", caregiverHandler.List)

	journalHandler := handlers.JournalHandler{DB: DB}
	r.POST("/journal-entries", journalHandler.Create)
	r.GET("/journal-entries", journalHandler.List)
	r.GET("/journal-entries/accepted", journalHandler.ListAccepted)
	r.PUT("/journal-entries/:id", journalHandler.Update)
	r.DELETE("/journal-entries/:id", journalHandler.Delete)

	commentHandler := handlers.CommentHandler{DB: DB}
	r.POST("/comments", commentHandler.Create)
	r.GET("/comments", commentHandler.List)
	r.PUT("/comments/:id", commentHandler.Update)
	r.DELETE("/comments/:id", commentHandler.Delete)

	todoHandler := handlers.TodoHandler{DB: DB}
	r.POST("/todos", todoHandler.Create)
	r.GET("/todos", todoHandler.List)
	r.GET("/todos/:id", todoHandler.GetByID)
	r.PUT("/todos/:id", todoHandler.Update)
	r.DELETE("/todos/:id", todoHandler.Delete)

	if err := r.Run(":8080"); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
