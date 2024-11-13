'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Image as ImageIcon, Grid, Mic, StopCircle, Coins } from 'lucide-react'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js'
import { useWallet, WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Assuming you've set up a backend API that interfaces with Gradio and HuggingFace
const API_URL = '035bebc1-3e21-4b5a-8031-a5634236df89'
const HELIUS_RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=035bebc1-3e21-4b5a-8031-a5634236df89'
const GRIN_CONTRACT_ADDRESS = '7JofsgKgD3MerQDa7hEe4dfkY3c3nMnsThZzUuYyTFpE'

// Mock data for the GRIN token chart
const grinChartData = [
  { date: '2023-01-01', price: 0.1 },
  { date: '2023-02-01', price: 0.15 },
  { date: '2023-03-01', price: 0.12 },
  { date: '2023-04-01', price: 0.18 },
  { date: '2023-05-01', price: 0.22 },
  { date: '2023-06-01', price: 0.20 },
]

function GrinChart() {
  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={grinChartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a2b4a" />
          <XAxis dataKey="date" stroke="#4a6fa5" />
          <YAxis stroke="#4a6fa5" />
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
          <Line type="monotone" dataKey="price" stroke="#38bdf8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ArtStudioComponent() {
  const [chatMessages, setChatMessages] = useState([])
  const [prompt, setPrompt] = useState('')
  const [generatedImages, setGeneratedImages] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [audioAnswer, setAudioAnswer] = useState(null)
  const [textAnswer, setTextAnswer] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [grinPrice, setGrinPrice] = useState(0.20) // Mock price, replace with real data
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const wallet = useWallet()

  const connection = new Connection(HELIUS_RPC_URL)
  const metaplex = new Metaplex(connection).use(walletAdapterIdentity(wallet))

  const handleSendMessage = async () => {
    if (prompt.trim()) {
      setChatMessages([...chatMessages, { role: 'user', content: prompt }])
      // Here you would typically send the message to your AI backend
      // and get a response. For now, we'll just echo the message.
      setChatMessages(prev => [...prev, { role: 'assistant', content: `You said: ${prompt}` }])
      setPrompt('')
    }
  }

  const handleGenerateImage = async () => {
    if (prompt.trim()) {
      setIsProcessing(true)
      try {
        // Here you would typically send the prompt to your Stable Diffusion API
        // For now, we'll just add a placeholder image
        const newImage = `/placeholder.svg?height=512&width=512&text=${encodeURIComponent(prompt)}`
        setGeneratedImages(prev => [...prev, { src: newImage, prompt }])
      } catch (error) {
        console.error('Error generating image:', error)
      }
      setIsProcessing(false)
      setPrompt('')
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      mediaRecorderRef.current.onstop = sendAudioToBackend
      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const sendAudioToBackend = async () => {
    setIsProcessing(true)
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.wav')

    try {
      const response = await fetch(`${API_URL}/process-audio`, {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      setTextAnswer(data.answer)
      setAudioAnswer(data.audio_out)
    } catch (error) {
      console.error('Error sending audio to backend:', error)
      setTextAnswer('Error processing audio. Please try again.')
    }

    setIsProcessing(false)
    audioChunksRef.current = []
  }

  const mintNFT = async (imageUrl, prompt) => {
    if (!wallet.connected) {
      alert('Please connect your wallet first.')
      return
    }

    setIsMinting(true)
    try {
      const { uri } = await metaplex.nfts().uploadMetadata({
        name: `GRIN Vision: ${prompt.slice(0, 20)}...`,
        description: `AI-generated image based on the prompt: ${prompt}`,
        image: imageUrl,
      })

      const { nft } = await metaplex.nfts().create({
        uri: uri,
        name: `GRIN Vision: ${prompt.slice(0, 20)}...`,
        sellerFeeBasisPoints: 500, // 5% royalty
      })

      alert(`NFT minted successfully! Mint address: ${nft.address.toString()}`)
    } catch (error) {
      console.error('Error minting NFT:', error)
      alert('Error minting NFT. Please try again.')
    }
    setIsMinting(false)
  }

  return (
    <ConnectionProvider endpoint={HELIUS_RPC_URL}>
      <WalletProvider wallets={[/* Add your supported wallet adapters here */]}>
        <WalletModalProvider>
          <div className="flex flex-col min-h-screen bg-[#0f172a] text-[#e2e8f0]">
            {/* Header */}
            <header className="flex justify-between items-center p-4 bg-[#1e293b]">
              <h1 className="text-2xl font-bold text-[#38bdf8]">GRIN Vision</h1>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm">$GRIN Price</p>
                  <p className="text-lg font-bold text-[#38bdf8]">${grinPrice.toFixed(2)}</p>
                </div>
                <WalletMultiButton className="bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#0f172a]" />
              </div>
            </header>

            {/* GRIN Chart */}
            <div className="w-full max-w-4xl mx-auto mt-8">
              <h2 className="text-xl font-bold mb-2 text-center text-[#38bdf8]">$GRIN Price Chart</h2>
              <GrinChart />
            </div>

            {/* Contract Address */}
            <div className="text-center mt-4">
              <p className="text-sm text-[#94a3b8]">$GRIN Contract Address:</p>
              <p className="text-[#38bdf8] font-mono">{GRIN_CONTRACT_ADDRESS}</p>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex mt-8">
              {/* Sidebar */}
              <div className="w-16 bg-[#1e293b] flex flex-col items-center py-4 space-y-4">
                <Button variant="ghost" size="icon" className="text-[#94a3b8] hover:text-[#38bdf8]">
                  <MessageSquare />
                </Button>
                <Button variant="ghost" size="icon" className="text-[#94a3b8] hover:text-[#38bdf8]">
                  <ImageIcon />
                </Button>
                <Button variant="ghost" size="icon" className="text-[#94a3b8] hover:text-[#38bdf8]">
                  <Grid />
                </Button>
                <Button variant="ghost" size="icon" className="text-[#94a3b8] hover:text-[#38bdf8]">
                  <Mic />
                </Button>
              </div>

              {/* Tabs and Content */}
              <div className="flex-1 flex flex-col">
                <Tabs defaultValue="chat" className="flex-1 flex flex-col">
                  <TabsList className="justify-start bg-[#1e293b] p-2">
                    <TabsTrigger value="chat" className="data-[state=active]:bg-[#38bdf8] data-[state=active]:text-[#0f172a]">Chat</TabsTrigger>
                    <TabsTrigger value="generate" className="data-[state=active]:bg-[#38bdf8] data-[state=active]:text-[#0f172a]">Generate</TabsTrigger>
                    <TabsTrigger value="gallery" className="data-[state=active]:bg-[#38bdf8] data-[state=active]:text-[#0f172a]">Gallery</TabsTrigger>
                    <TabsTrigger value="magic8ball" className="data-[state=active]:bg-[#38bdf8] data-[state=active]:text-[#0f172a]">Magic 8 Ball</TabsTrigger>
                  </TabsList>

                  {/* Chat Tab */}
                  <TabsContent value="chat" className="flex-1 flex flex-col p-4">
                    <ScrollArea className="flex-1 mb-4 border border-[#2d3748] rounded-md p-4">
                      {chatMessages.map((msg, index) => (
                        <div key={index} className={`mb-2 ${msg.role === 'assistant' ? 'text-[#38bdf8]' : 'text-[#e2e8f0]'}`}>
                          <strong>{msg.role === 'assistant' ? 'AI: ' : 'You: '}</strong>{msg.content}
                        </div>
                      ))}
                    </ScrollArea>
                    <div className="flex space-x-2">
                      <Input
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-[#1e293b] border-[#2d3748] text-[#e2e8f0]"
                      />
                      <Button onClick={handleSendMessage} className="bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#0f172a]">Send</Button>
                    </div>
                  </TabsContent>

                  {/* Generate Tab */}
                  <TabsContent value="generate" className="flex-1 flex flex-col p-4">
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the image you want to generate..."
                      className="flex-1 mb-4 bg-[#1e293b] border-[#2d3748] text-[#e2e8f0]"
                    />
                    <Button onClick={handleGenerateImage} disabled={isProcessing} className="w-full bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#0f172a]">
                      {isProcessing ? 'Generating...' : 'Generate Image'}
                    </Button>
                  </TabsContent>

                  {/* Gallery Tab */}
                  <TabsContent value="gallery" className="flex-1 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {generatedImages.map((image, index) => (
                        <Card key={index} className="bg-[#1e293b] border-[#2d3748]">
                          <CardContent className="p-2 flex flex-col items-center">
                            <img src={image.src} alt={`Generated image ${index + 1}`} className="w-full h-auto rounded-md mb-2" />
                            <div className="flex space-x-2 mt-2">
                              <Button onClick={() => mintNFT(image.src, image.prompt)} disabled={isMinting} className="flex items-center bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#0f172a]">
                                <Coins className="mr-2 h-4 w-4" />
                                {isMinting ? 'Minting...' : 'Mint as NFT'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Magic 8 Ball Tab */}
                  <TabsContent value="magic8ball" className="flex-1 flex flex-col p-4">
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                      <h1 className="text-3xl font-bold mb-2 text-[#38bdf8]">Magic 8 Ball 🎱</h1>
                      <h3 className="text-xl mb-4">Ask a question and receive wisdom</h3>
                      <Button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`w-32 h-32 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-[#38bdf8] hover:bg-[#0ea5e9]'} text-[#0f172a]`}
                        disabled={isProcessing}
                      >
                        {isRecording ? <StopCircle className="w-16 h-16" /> : <Mic className="w-16 h-16" />}
                      </Button>
                      <p>{isRecording ? 'Recording... Click to stop' : 'Click to start recording'}</p>
                      {isProcessing && <p>Processing your question...</p>}
                      {textAnswer && (
                        <div className="mt-4 p-4 bg-[#1e293b] rounded-md max-w-md w-full">
                          <h3 className="text-xl font-bold mb-2 text-[#38bdf8]">Magic 8 Ball says:</h3>
                          <p className="text-lg">{textAnswer}</p>
                        </div>
                      )}
                      {audioAnswer && (
                        <div className="mt-4 max-w-md w-full">
                          <h3 className="text-xl font-bold mb-2 text-[#38bdf8]">Spoken Answer:</h3>
                          <audio src={audioAnswer} controls className="w-full" autoPlay />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}