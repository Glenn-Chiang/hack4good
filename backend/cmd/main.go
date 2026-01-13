package main

import (
	"hack4good/internal/db"
	"hack4good/internal/handlers"
	"hack4good/internal/models"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	DB := db.Connect()

	if err := DB.AutoMigrate(&models.User{}, &models.Caregiver{}, &models.Recipient{}); err != nil {
		log.Fatalf("migrate failed: %v", err)
	}

	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

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

	if err := r.Run(":8080"); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
