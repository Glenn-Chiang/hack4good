package main

import (
	"hack4good/internal/db"
	"hack4good/internal/handlers"
	"hack4good/internal/models"
	"log"
	"os"
	"strings"
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
		&models.CareRequest{},
		&models.JournalEntry{},
		&models.Comment{},
		&models.Todo{},
	); err != nil {
		log.Fatalf("migrate failed: %v", err)
	}

	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

	origins := strings.Split(os.Getenv("CORS_ORIGINS"), ",")
	for i := range origins {
		origins[i] = strings.TrimSpace(origins[i])
	}

	r.Use(cors.New(cors.Config{
		AllowOrigins:     origins,
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
	r.GET("/caregivers/:id/recipients", recipientHandler.ListByCaregiver)
	r.GET("/recipients/:id", recipientHandler.GetByID)
	r.PUT("/recipients/:id", recipientHandler.Update)
	r.GET("/recipients/user/:userId", recipientHandler.GetByUserID)

	caregiverHandler := handlers.CaregiverHandler{DB: DB}
	r.GET("/caregivers", caregiverHandler.List)
	r.PUT("/caregivers/:id", caregiverHandler.Update)
	r.GET("/recipients/:id/caregivers", caregiverHandler.ListByRecipient)
	r.GET("/caregivers/user/:userId", caregiverHandler.GetByUserID)

	careRequestHandler := handlers.CareRequestHandler{DB: DB}
	r.POST("/requests", careRequestHandler.CreateRequest)
	r.GET("/recipients/:id/requests", careRequestHandler.ListRecipientRequests)
	r.PATCH("/requests/:id", careRequestHandler.RespondToRequest)

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

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if err := r.Run("0.0.0.0:" + port); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
