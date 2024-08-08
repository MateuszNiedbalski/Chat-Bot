'use client'

import { Box, Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';

export default function Home() {
  // FIX: SET INITIAL MESSAGE
  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");

  // Send message function
  const sendMessage = async () => {
    setMessage("");
    setMessages((messages) => [
      ...messages,
      {
        role: "user", parts: [{ text: message }]
      },
      {
        role: "model", parts: [{ text: ""}] // Placeholder message so that model can load its answer in
      }
    ])

    // Sends a POST request to the server
    const response = fetch('/api/chat', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify([...messages, { role: "user", parts: [{ text: message }] }])
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let result = "";

      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        };

        const text = decoder.decode(value || new Uint8Array(), { stream: true}) // Decodes incoming input stream
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1)

          console.log(messages)
          console.log("lastMESSAGE: " + JSON.stringify(lastMessage)); // Add response to the placeholder message

          return [
            ...otherMessages,
            {...lastMessage, parts: [{ text: lastMessage.parts[0].text + text}]}
          ]
        })

        return reader.read().then(processText);
      })
    })

  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // UI
  return (
    <Box width="100vw" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <Stack direction={'column'} width="500px" height="700px" border="1px solid black" p={2} spacing={3}>
        <Stack direction={'column'} spacing={2} flexGrow={1} overflow="auto" maxHeight="100%">
          {messages.map((message, index) => (
            <Box key={index} display="flex" justifyContent={message.role === 'model' ? 'flex-start' : 'flex-end'}>
              <Box bgcolor={ message.role === 'model' ? 'primary.main' : 'secondary.main'} color="white" borderRadius={16} p={3}>
                {message.parts[0].text}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField label="Message" fullWidth value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={handleKeyPress}></TextField>
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

