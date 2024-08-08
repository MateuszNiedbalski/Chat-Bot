'use client'

import { Box, Button, Stack, TextField } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "model",
      parts: [{ text: "Hi! I'm the Headstarter support assistant. How can I help you today?" }]
    }
  ]);

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false)
  // Send message function
  const sendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true)
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
    try{
    const response = await fetch('/api/chat', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify([...messages, { role: "user", parts: [{ text: message }] }])
    });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let result = "";

      const processText = async({done, value}) => {
        if (done) return result;

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

        result += text;
        return reader.read().then(processText);
      };

      await reader.read().then(processText)

    } catch (error) {
      console.error("Error sending message", error);

      setMessages((messages) => [
        ...messages.slice(0, messages.length - 1), // Remove the placeholder
        {
          role: 'model',
          parts: [{ text: "An error occurred while sending the message." }], // Corrected the error message
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  //auto scrolling feature
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // UI
  return (
    <Box width="100vw" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <Stack direction={'column'} width="500px" height="700px" border="1px solid black" p={2} spacing={3}>
        <Stack direction={'column'} spacing={2} flexGrow={1} overflow="auto" maxHeight="100%">
          {messages.map((message, index) => (
            <Box key={index} display="flex" justifyContent={message.role === 'model' ? 'flex-start' : 'flex-end'}>
              <Box bgcolor={ message.role === 'model' ? 'primary.main' : 'secondary.main'} color="white" borderRadius={1} p={3}>
                <Markdown>{message.parts[0].text}</Markdown>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField label="Message" fullWidth value={message} placeholder='Say "Hello" to begin chatting!' onChange={(e) => setMessage(e.target.value)} onKeyPress={handleKeyPress} disabled={isLoading}></TextField>
          <Button variant="contained" onClick={sendMessage} disabled={isLoading}>
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

