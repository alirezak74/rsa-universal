package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/handlers"
	_ "github.com/lib/pq"
)

// Account represents an RSA account
type Account struct {
	AccountID string    `json:"account_id"`
	Sequence  string    `json:"sequence"`
	Balances  []Balance `json:"balances"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Balance represents account balance
type Balance struct {
	AssetType   string `json:"asset_type"`
	AssetCode   string `json:"asset_code,omitempty"`
	AssetIssuer string `json:"asset_issuer,omitempty"`
	Balance     string `json:"balance"`
	Limit       string `json:"limit,omitempty"`
}

// Transaction represents an RSA transaction
type Transaction struct {
	ID               string      `json:"id"`
	Hash             string      `json:"hash"`
	Ledger           int64       `json:"ledger"`
	SourceAccount    string      `json:"source_account"`
	Fee              string      `json:"fee"`
	OperationCount   int         `json:"operation_count"`
	CreatedAt        time.Time   `json:"created_at"`
	Successful       bool        `json:"successful"`
	Operations       []Operation `json:"operations,omitempty"`
	Signatures       []string    `json:"signatures"`
}

// Operation represents a transaction operation
type Operation struct {
	ID            string    `json:"id"`
	Type          string    `json:"type"`
	From          string    `json:"from,omitempty"`
	To            string    `json:"to,omitempty"`
	Asset         Asset     `json:"asset,omitempty"`
	Amount        string    `json:"amount,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
	TransactionID string    `json:"transaction_id"`
}

// Asset represents an RSA asset
type Asset struct {
	AssetType   string `json:"asset_type"`
	AssetCode   string `json:"asset_code,omitempty"`
	AssetIssuer string `json:"asset_issuer,omitempty"`
}

// Ledger represents a blockchain ledger
type Ledger struct {
	Sequence         int64     `json:"sequence"`
	Hash             string    `json:"hash"`
	PrevHash         string    `json:"prev_hash"`
	TransactionCount int       `json:"transaction_count"`
	OperationCount   int       `json:"operation_count"`
	ClosedAt         time.Time `json:"closed_at"`
	TotalCoins       string    `json:"total_coins"`
	FeePool          string    `json:"fee_pool"`
	BaseFee          string    `json:"base_fee"`
	BaseReserve      string    `json:"base_reserve"`
}

// Offer represents a trading offer
type Offer struct {
	ID       string    `json:"id"`
	Seller   string    `json:"seller"`
	Selling  Asset     `json:"selling"`
	Buying   Asset     `json:"buying"`
	Amount   string    `json:"amount"`
	Price    string    `json:"price"`
	PriceR   PriceR    `json:"price_r"`
	LastModified int64 `json:"last_modified_ledger"`
}

// PriceR represents a price ratio
type PriceR struct {
	Numerator   int `json:"n"`
	Denominator int `json:"d"`
}

// Payment represents a payment operation
type Payment struct {
	ID            string    `json:"id"`
	From          string    `json:"from"`
	To            string    `json:"to"`
	Asset         Asset     `json:"asset"`
	Amount        string    `json:"amount"`
	CreatedAt     time.Time `json:"created_at"`
	TransactionID string    `json:"transaction_id"`
}

// APIResponse represents a standard API response
type APIResponse struct {
	Embedded interface{} `json:"_embedded,omitempty"`
	Links    Links       `json:"_links"`
}

// Links represents HAL links
type Links struct {
	Self Link `json:"self"`
	Next Link `json:"next,omitempty"`
	Prev Link `json:"prev,omitempty"`
}

// Link represents a HAL link
type Link struct {
	Href      string `json:"href"`
	Templated bool   `json:"templated,omitempty"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Type     string `json:"type"`
	Title    string `json:"title"`
	Status   int    `json:"status"`
	Detail   string `json:"detail,omitempty"`
	Instance string `json:"instance,omitempty"`
}

// Database connection
var db *sql.DB

// Initialize database connection
func initDB() {
	var err error
	
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "5432")
	dbUser := getEnv("DB_USER", "rsachain")
	dbPass := getEnv("DB_PASS", "changeme")
	dbName := getEnv("DB_NAME", "rsachain")
	
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPass, dbName)
	
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	
	// Test connection
	if err = db.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}
	
	log.Println("Connected to database successfully")
	
	// Create tables if they don't exist
	createTables()
}

// Create database tables
func createTables() {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS accounts (
			account_id VARCHAR(56) PRIMARY KEY,
			sequence BIGINT NOT NULL DEFAULT 0,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS balances (
			account_id VARCHAR(56) REFERENCES accounts(account_id),
			asset_type VARCHAR(20) NOT NULL,
			asset_code VARCHAR(12),
			asset_issuer VARCHAR(56),
			balance DECIMAL(20,7) NOT NULL DEFAULT 0,
			balance_limit DECIMAL(20,7),
			PRIMARY KEY (account_id, asset_type, COALESCE(asset_code, ''), COALESCE(asset_issuer, ''))
		)`,
		`CREATE TABLE IF NOT EXISTS ledgers (
			sequence BIGINT PRIMARY KEY,
			hash VARCHAR(64) UNIQUE NOT NULL,
			prev_hash VARCHAR(64),
			transaction_count INTEGER DEFAULT 0,
			operation_count INTEGER DEFAULT 0,
			closed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			total_coins DECIMAL(20,7) DEFAULT 100000000000,
			fee_pool DECIMAL(20,7) DEFAULT 0,
			base_fee INTEGER DEFAULT 100,
			base_reserve DECIMAL(20,7) DEFAULT 10
		)`,
		`CREATE TABLE IF NOT EXISTS transactions (
			id VARCHAR(64) PRIMARY KEY,
			hash VARCHAR(64) UNIQUE NOT NULL,
			ledger_sequence BIGINT REFERENCES ledgers(sequence),
			source_account VARCHAR(56) REFERENCES accounts(account_id),
			fee BIGINT NOT NULL,
			operation_count INTEGER DEFAULT 0,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			successful BOOLEAN DEFAULT true
		)`,
		`CREATE TABLE IF NOT EXISTS operations (
			id VARCHAR(64) PRIMARY KEY,
			transaction_id VARCHAR(64) REFERENCES transactions(id),
			type VARCHAR(50) NOT NULL,
			operation_order INTEGER NOT NULL,
			source_account VARCHAR(56),
			destination_account VARCHAR(56),
			asset_type VARCHAR(20),
			asset_code VARCHAR(12),
			asset_issuer VARCHAR(56),
			amount DECIMAL(20,7),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS offers (
			id BIGSERIAL PRIMARY KEY,
			seller VARCHAR(56) REFERENCES accounts(account_id),
			selling_asset_type VARCHAR(20) NOT NULL,
			selling_asset_code VARCHAR(12),
			selling_asset_issuer VARCHAR(56),
			buying_asset_type VARCHAR(20) NOT NULL,
			buying_asset_code VARCHAR(12),
			buying_asset_issuer VARCHAR(56),
			amount DECIMAL(20,7) NOT NULL,
			price_n INTEGER NOT NULL,
			price_d INTEGER NOT NULL,
			last_modified_ledger BIGINT
		)`,
	}
	
	for _, query := range queries {
		if _, err := db.Exec(query); err != nil {
			log.Printf("Failed to create table: %v", err)
		}
	}
	
	// Insert sample data if tables are empty
	insertSampleData()
}

// Insert sample data for testing
func insertSampleData() {
	// Check if we have any accounts
	var count int
	db.QueryRow("SELECT COUNT(*) FROM accounts").Scan(&count)
	
	if count == 0 {
		log.Println("Inserting sample data...")
		
		// Insert sample ledger
		_, err := db.Exec(`INSERT INTO ledgers (sequence, hash, prev_hash) VALUES (1, $1, $2)`,
			"7d4e7e64c3a3e7b5c8e9f2a1b4c6d8e0f3a5b7c9d1e4f6a8b0c2d5e7f9a1b3c5",
			"0000000000000000000000000000000000000000000000000000000000000000")
		if err != nil {
			log.Printf("Failed to insert sample ledger: %v", err)
		}
		
		// Insert sample account
		sampleAccountID := "RSA1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890"
		_, err = db.Exec("INSERT INTO accounts (account_id, sequence) VALUES ($1, $2)", sampleAccountID, 1)
		if err != nil {
			log.Printf("Failed to insert sample account: %v", err)
		}
		
		// Insert sample balance
		_, err = db.Exec(`INSERT INTO balances (account_id, asset_type, balance) VALUES ($1, $2, $3)`,
			sampleAccountID, "native", 10000.0000000)
		if err != nil {
			log.Printf("Failed to insert sample balance: %v", err)
		}
		
		log.Println("Sample data inserted successfully")
	}
}

// Get environment variable with default
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// CORS middleware
func corsMiddleware(next http.Handler) http.Handler {
	return handlers.CORS(
		handlers.AllowedOrigins([]string{"*"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"*"}),
	)(next)
}

// JSON response helper
func writeJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

// Error response helper
func writeError(w http.ResponseWriter, status int, title, detail string) {
	w.Header().Set("Content-Type", "application/problem+json")
	w.WriteHeader(status)
	
	errorResp := ErrorResponse{
		Type:   "https://rsacrypto.com/errors/" + strconv.Itoa(status),
		Title:  title,
		Status: status,
		Detail: detail,
	}
	
	json.NewEncoder(w).Encode(errorResp)
}

// API Handlers

// Root handler
func rootHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"_links": map[string]interface{}{
			"account":      map[string]string{"href": "/accounts/{account_id}", "templated": true},
			"accounts":     map[string]string{"href": "/accounts{?cursor,limit,order}"},
			"account_transactions": map[string]string{"href": "/accounts/{account_id}/transactions{?cursor,limit,order}", "templated": true},
			"assets":       map[string]string{"href": "/assets{?asset_code,asset_issuer,cursor,limit,order}"},
			"ledgers":      map[string]string{"href": "/ledgers{?cursor,limit,order}"},
			"transactions": map[string]string{"href": "/transactions{?cursor,limit,order}"},
			"payments":     map[string]string{"href": "/payments{?cursor,limit,order}"},
		},
		"horizon_version": "1.0.0",
		"core_version":    "rsa-core-1.0.0",
		"network_passphrase": "RSA Chain Mainnet ; July 2024",
		"current_protocol_version": 19,
		"core_supported_protocol_version": 19,
	}
	
	writeJSON(w, response)
}

// Get account by ID
func getAccountHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	accountID := vars["account_id"]
	
	var account Account
	var createdAt, updatedAt time.Time
	
	err := db.QueryRow("SELECT account_id, sequence, created_at, updated_at FROM accounts WHERE account_id = $1",
		accountID).Scan(&account.AccountID, &account.Sequence, &createdAt, &updatedAt)
	
	if err != nil {
		if err == sql.ErrNoRows {
			writeError(w, 404, "Not Found", "Account not found")
			return
		}
		writeError(w, 500, "Internal Server Error", err.Error())
		return
	}
	
	account.CreatedAt = createdAt
	account.UpdatedAt = updatedAt
	
	// Get balances
	rows, err := db.Query(`SELECT asset_type, COALESCE(asset_code, ''), COALESCE(asset_issuer, ''), balance, COALESCE(balance_limit, '')
		FROM balances WHERE account_id = $1`, accountID)
	if err != nil {
		writeError(w, 500, "Internal Server Error", err.Error())
		return
	}
	defer rows.Close()
	
	var balances []Balance
	for rows.Next() {
		var balance Balance
		var limitStr string
		err := rows.Scan(&balance.AssetType, &balance.AssetCode, &balance.AssetIssuer, &balance.Balance, &limitStr)
		if err != nil {
			continue
		}
		
		if limitStr != "" {
			balance.Limit = limitStr
		}
		
		balances = append(balances, balance)
	}
	
	account.Balances = balances
	writeJSON(w, account)
}

// Get account transactions
func getAccountTransactionsHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	accountID := vars["account_id"]
	
	// Parse query parameters
	limit := getQueryParam(r, "limit", "10")
	cursor := getQueryParam(r, "cursor", "")
	order := getQueryParam(r, "order", "desc")
	
	limitInt, _ := strconv.Atoi(limit)
	if limitInt > 200 {
		limitInt = 200
	}
	
	query := `SELECT id, hash, ledger_sequence, source_account, fee, operation_count, created_at, successful
		FROM transactions WHERE source_account = $1`
	
	if cursor != "" {
		if order == "desc" {
			query += " AND id < $3"
		} else {
			query += " AND id > $3"
		}
	}
	
	if order == "desc" {
		query += " ORDER BY created_at DESC"
	} else {
		query += " ORDER BY created_at ASC"
	}
	
	query += " LIMIT $2"
	
	var rows *sql.Rows
	var err error
	
	if cursor != "" {
		rows, err = db.Query(query, accountID, limitInt, cursor)
	} else {
		rows, err = db.Query(query, accountID, limitInt)
	}
	
	if err != nil {
		writeError(w, 500, "Internal Server Error", err.Error())
		return
	}
	defer rows.Close()
	
	var transactions []Transaction
	for rows.Next() {
		var tx Transaction
		var ledgerSeq sql.NullInt64
		err := rows.Scan(&tx.ID, &tx.Hash, &ledgerSeq, &tx.SourceAccount,
			&tx.Fee, &tx.OperationCount, &tx.CreatedAt, &tx.Successful)
		if err != nil {
			continue
		}
		
		if ledgerSeq.Valid {
			tx.Ledger = ledgerSeq.Int64
		}
		
		transactions = append(transactions, tx)
	}
	
	response := APIResponse{
		Embedded: map[string]interface{}{
			"records": transactions,
		},
		Links: Links{
			Self: Link{Href: fmt.Sprintf("/accounts/%s/transactions", accountID)},
		},
	}
	
	writeJSON(w, response)
}

// Submit transaction
func submitTransactionHandler(w http.ResponseWriter, r *http.Request) {
	var submitReq struct {
		TX         string   `json:"tx"`
		Signatures []string `json:"signatures"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&submitReq); err != nil {
		writeError(w, 400, "Bad Request", "Invalid JSON")
		return
	}
	
	// Parse transaction (simplified)
	var txData map[string]interface{}
	if err := json.Unmarshal([]byte(submitReq.TX), &txData); err != nil {
		writeError(w, 400, "Bad Request", "Invalid transaction format")
		return
	}
	
	// Generate transaction ID and hash
	txID := fmt.Sprintf("tx_%d", time.Now().UnixNano())
	txHash := fmt.Sprintf("hash_%d", time.Now().UnixNano())
	
	// Insert transaction
	_, err := db.Exec(`INSERT INTO transactions (id, hash, source_account, fee, operation_count)
		VALUES ($1, $2, $3, $4, $5)`,
		txID, txHash, txData["source"], 100, len(txData["operations"].([]interface{})))
	
	if err != nil {
		writeError(w, 500, "Internal Server Error", "Failed to submit transaction")
		return
	}
	
	response := map[string]interface{}{
		"hash":       txHash,
		"ledger":     1,
		"envelope_xdr": submitReq.TX,
		"result_xdr": "success",
	}
	
	writeJSON(w, response)
}

// Get assets
func getAssetsHandler(w http.ResponseWriter, r *http.Request) {
	assets := []map[string]interface{}{
		{
			"asset_type":   "native",
			"asset_code":   "RSA",
			"asset_issuer": "",
			"paging_token": "RSA_native",
			"amount":       "100000000000.0000000",
			"num_claimable_balances": 0,
			"num_liquidity_pools":    0,
			"num_contracts":          0,
			"num_archived_contracts": 0,
			"num_accounts":           1,
			"claimable_balances_amount": "0.0000000",
			"liquidity_pools_amount":    "0.0000000",
			"contracts_amount":          "0.0000000",
			"archived_contracts_amount": "0.0000000",
			"balances": map[string]string{
				"authorized":                      "100000000000.0000000",
				"authorized_to_maintain_liabilities": "0.0000000",
				"unauthorized":                        "0.0000000",
			},
		},
	}
	
	response := APIResponse{
		Embedded: map[string]interface{}{
			"records": assets,
		},
		Links: Links{
			Self: Link{Href: "/assets"},
		},
	}
	
	writeJSON(w, response)
}

// Get ledgers
func getLedgersHandler(w http.ResponseWriter, r *http.Request) {
	limit := getQueryParam(r, "limit", "10")
	limitInt, _ := strconv.Atoi(limit)
	if limitInt > 200 {
		limitInt = 200
	}
	
	rows, err := db.Query(`SELECT sequence, hash, prev_hash, transaction_count, operation_count,
		closed_at, total_coins, fee_pool, base_fee, base_reserve
		FROM ledgers ORDER BY sequence DESC LIMIT $1`, limitInt)
	
	if err != nil {
		writeError(w, 500, "Internal Server Error", err.Error())
		return
	}
	defer rows.Close()
	
	var ledgers []Ledger
	for rows.Next() {
		var ledger Ledger
		err := rows.Scan(&ledger.Sequence, &ledger.Hash, &ledger.PrevHash,
			&ledger.TransactionCount, &ledger.OperationCount, &ledger.ClosedAt,
			&ledger.TotalCoins, &ledger.FeePool, &ledger.BaseFee, &ledger.BaseReserve)
		if err != nil {
			continue
		}
		ledgers = append(ledgers, ledger)
	}
	
	response := APIResponse{
		Embedded: map[string]interface{}{
			"records": ledgers,
		},
		Links: Links{
			Self: Link{Href: "/ledgers"},
		},
	}
	
	writeJSON(w, response)
}

// Get transactions
func getTransactionsHandler(w http.ResponseWriter, r *http.Request) {
	limit := getQueryParam(r, "limit", "10")
	limitInt, _ := strconv.Atoi(limit)
	if limitInt > 200 {
		limitInt = 200
	}
	
	rows, err := db.Query(`SELECT id, hash, ledger_sequence, source_account, fee,
		operation_count, created_at, successful FROM transactions
		ORDER BY created_at DESC LIMIT $1`, limitInt)
	
	if err != nil {
		writeError(w, 500, "Internal Server Error", err.Error())
		return
	}
	defer rows.Close()
	
	var transactions []Transaction
	for rows.Next() {
		var tx Transaction
		var ledgerSeq sql.NullInt64
		err := rows.Scan(&tx.ID, &tx.Hash, &ledgerSeq, &tx.SourceAccount,
			&tx.Fee, &tx.OperationCount, &tx.CreatedAt, &tx.Successful)
		if err != nil {
			continue
		}
		
		if ledgerSeq.Valid {
			tx.Ledger = ledgerSeq.Int64
		}
		
		transactions = append(transactions, tx)
	}
	
	response := APIResponse{
		Embedded: map[string]interface{}{
			"records": transactions,
		},
		Links: Links{
			Self: Link{Href: "/transactions"},
		},
	}
	
	writeJSON(w, response)
}

// Get payments
func getPaymentsHandler(w http.ResponseWriter, r *http.Request) {
	limit := getQueryParam(r, "limit", "10")
	limitInt, _ := strconv.Atoi(limit)
	if limitInt > 200 {
		limitInt = 200
	}
	
	// Mock payments data
	payments := []Payment{
		{
			ID:   "payment_1",
			From: "RSA1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890",
			To:   "RSA9876543210FEDCBA9876543210FEDCBA9876543210FEDCBA9876543210",
			Asset: Asset{
				AssetType: "native",
			},
			Amount:        "100.0000000",
			CreatedAt:     time.Now(),
			TransactionID: "tx_1",
		},
	}
	
	response := APIResponse{
		Embedded: map[string]interface{}{
			"records": payments,
		},
		Links: Links{
			Self: Link{Href: "/payments"},
		},
	}
	
	writeJSON(w, response)
}

// Health check handler
func healthHandler(w http.ResponseWriter, r *http.Request) {
	status := map[string]interface{}{
		"status": "ok",
		"version": "1.0.0",
		"database": "connected",
		"timestamp": time.Now(),
	}
	
	writeJSON(w, status)
}

// Get query parameter with default
func getQueryParam(r *http.Request, key, defaultValue string) string {
	if value := r.URL.Query().Get(key); value != "" {
		return value
	}
	return defaultValue
}

func main() {
	// Initialize database
	initDB()
	defer db.Close()
	
	// Create router
	r := mux.NewRouter()
	
	// API routes
	r.HandleFunc("/", rootHandler).Methods("GET")
	r.HandleFunc("/health", healthHandler).Methods("GET")
	r.HandleFunc("/accounts/{account_id}", getAccountHandler).Methods("GET")
	r.HandleFunc("/accounts/{account_id}/transactions", getAccountTransactionsHandler).Methods("GET")
	r.HandleFunc("/transactions", submitTransactionHandler).Methods("POST")
	r.HandleFunc("/transactions", getTransactionsHandler).Methods("GET")
	r.HandleFunc("/assets", getAssetsHandler).Methods("GET")
	r.HandleFunc("/ledgers", getLedgersHandler).Methods("GET")
	r.HandleFunc("/payments", getPaymentsHandler).Methods("GET")
	
	// Add CORS middleware
	handler := corsMiddleware(r)
	
	// Get port from environment
	port := getEnv("PORT", "8000")
	
	log.Printf("RSA Horizon API server starting on port %s", port)
	log.Printf("Database: Connected")
	log.Printf("Network: RSA Chain Mainnet")
	
	// Start server
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
