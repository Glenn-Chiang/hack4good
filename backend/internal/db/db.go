package db

import (
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() *gorm.DB {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		// Example fallback; prefer DATABASE_URL in real use
		host := getenv("DB_HOST", "localhost")
		port := getenv("DB_PORT", "5432")
		user := getenv("DB_USER", "postgres")
		pass := getenv("DB_PASSWORD", "postgres")
		name := getenv("DB_NAME", "myapi")
		ssl := getenv("DB_SSLMODE", "disable")
		dsn = fmt.Sprintf(
			"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s TimeZone=UTC",
			host, port, user, pass, name, ssl,
		)
	}

	cfg := &gorm.Config{}
	conn, err := gorm.Open(postgres.Open(dsn), cfg)
	if err != nil {
		log.Fatalf("db connect failed: %v", err)
	}

	sqlDB, err := conn.DB()
	if err != nil {
		log.Fatalf("db handle failed: %v", err)
	}
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetConnMaxLifetime(30 * time.Minute)

	DB = conn
	return conn
}

func getenv(k, def string) string {
	v := os.Getenv(k)
	if v == "" {
		return def
	}
	return v
}
