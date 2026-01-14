package main

import (
	"hack4good/internal/db"
	"hack4good/internal/handlers"
	"hack4good/internal/models"
	"log"

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
		&models.JournalEntry{},
		&models.Comment{},
		&models.Todo{},
	); err != nil {
		log.Fatalf("migrate failed: %v", err)
	}

	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

	authHandler := handlers.AuthHandler{DB: DB}
	r.POST("/login", authHandler.Login)
	r.POST("/signup", authHandler.Signup)

	recipientHandler := handlers.RecipientHandler{DB: DB}
	r.POST("/recipients", recipientHandler.Create)
	r.GET("/recipients", recipientHandler.List)

	caregiverHandler := handlers.CaregiverHandler{DB: DB}
	r.POST("/caregivers", caregiverHandler.Create)
	r.GET("/caregivers", caregiverHandler.List)

	journalHandler := handlers.JournalHandler{DB: DB}
	r.POST("/journal-entries", journalHandler.Create)
	r.GET("/journal-entries", journalHandler.List)
	r.GET("/journal-entries/:id", journalHandler.GetByID)
	r.PUT("/journal-entries/:id", journalHandler.Update)
	r.DELETE("/journal-entries/:id", journalHandler.Delete)

	commentHandler := handlers.CommentHandler{DB: DB}
	r.POST("/comments", commentHandler.Create)
	r.GET("/comments", commentHandler.List)
	r.GET("/comments/:id", commentHandler.GetByID)
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
