package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type Data struct {
	Name  string `json:"name"`
	Rank  int    `json:"rank"`
	Score int    `json:"score"`
	Time  int    `json:"time"`
}

var dataStore []Data

func main() {
	// add couple template scores to the scoreboard
	for i := 0; i < 6; i++ {
		dataStore = append(dataStore, Data{Name: fmt.Sprintf("Player%d", 1+i), Rank: 1 + i, Score: 2000 - i*100, Time: 30 - i*4})
	}


	http.HandleFunc("/scoreboard", handleAPI)
	fmt.Println("API Started on port 8081. http://localhost:8081/scoreboard .CTRL+C to exit")
	http.ListenAndServe(":8081", nil)
}

func handleAPI(w http.ResponseWriter, r *http.Request) {
	// CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	switch r.Method {
	case http.MethodOptions:
		// Preflight request, respond with OK status
		w.WriteHeader(http.StatusOK)
		return
	case http.MethodGet:
		getData(w, r)
	case http.MethodPost:
		saveData(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func getData(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(dataStore)
}

func saveData(w http.ResponseWriter, r *http.Request) {
	var newData Data
	err := json.NewDecoder(r.Body).Decode(&newData)
	if err != nil {
		http.Error(w, "Invalid JSON data", http.StatusBadRequest)
		fmt.Println(err)
		return
	}
	dataStore = append(dataStore, newData)

	w.WriteHeader(http.StatusCreated)
}

func printData() { // this func is for debugging
	jsonData, err := json.Marshal(dataStore)
	if err != nil {
		return
	}
	fmt.Println(string(jsonData))
}
