package main

import (
  "fmt"
  "net/http"
  "time"

  "github.com/gin-gonic/gin"
  "github.com/gin-gonic/contrib/static"
  "github.com/gin-gonic/contrib/ginrus"

  "github.com/gorilla/websocket"
  "github.com/Sirupsen/logrus"
)

var log = logrus.New()

var wsupgrader = websocket.Upgrader{
  ReadBufferSize:  1024,
  WriteBufferSize: 1024,
}

func wshandler(w http.ResponseWriter, r *http.Request) {
  conn, err := wsupgrader.Upgrade(w, r, nil)
  if err != nil {
    fmt.Println("Failed to set websocket upgrade: %+v", err)
    return
  }

  for {
    t, msg, err := conn.ReadMessage()
    if err != nil {
      break
    }
    conn.WriteMessage(t, msg)
  }
}

func main() {
  r := gin.Default()

  r.Use(ginrus.Ginrus(log, time.RFC3339, false))

  r.Use(static.Serve("/", static.LocalFile("./static", true)))

  r.GET("/ws", func(c *gin.Context) {
    wshandler(c.Writer, c.Request)
  })

  r.Run("localhost:12312")
}
