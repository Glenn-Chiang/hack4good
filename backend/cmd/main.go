package main

import (
	"hack4good/internal/db"
	"hack4good/internal/handlers"
	"hack4good/internal/models"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	conn := db.Connect()

	if err := conn.AutoMigrate(&models.User{}, &models.Caregiver{}, &models.Recipient{}); err != nil {
		log.Fatalf("migrate failed: %v", err)
	}

	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

	recipientHandler := handlers.RecipientHandler{DB: conn}
	r.POST("/recipients", recipientHandler.Create)
	r.GET("/recipients", recipientHandler.List)

	caregiverHandler := handlers.CaregiverHandler{DB: conn}
	r.POST("/caregivers", caregiverHandler.Create)
	r.GET("/caregivers", caregiverHandler.List)

	if err := r.Run(":8080"); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
