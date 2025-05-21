
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, AlertCircle, Camera, Upload, Wand2, Eraser, Save, XCircle, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { RecognizeArtSuppliesOutput, RecognizedArtSupply } from '@/lib/types';
import { analyzeArtSuppliesImage } from './actions';
import { updateInventoryWithRecognizedItems } from '@/lib/inventory-service';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


const PLACEHOLDER_IMAGE = "https://placehold.co/600x400.png";

export default function ArtRecognitionPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'webcam'>('upload');
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(PLACEHOLDER_IMAGE);
  const [file, setFile] = useState<File | null>(null);
  const [userInstructions, setUserInstructions] = useState<string>('');
  
  const [results, setResults] = useState<RecognizeArtSuppliesOutput | null>(null);
  const [editableItems, setEditableItems] = useState<RecognizedArtSupply[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isWebcamOn, setIsWebcamOn] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const f = event.target.files?.[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setImageDataUri(dataUri);
        setImagePreview(dataUri);
        setResults(null);
        setEditableItems([]);
        setError(null);
      };
      reader.readAsDataURL(f);
    }
  };

  const startWebcam = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setHasCameraPermission(true);
        setIsWebcamOn(true);
        setImageDataUri(null);
        setImagePreview(PLACEHOLDER_IMAGE);
        setResults(null);
        setEditableItems([]);
        setError(null);
        toast({ title: "Webcam started" });
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setHasCameraPermission(false);
        setIsWebcamOn(false);
        toast({
          variant: "destructive",
          title: "Webcam Error",
          description: "Could not access webcam. Please check permissions.",
        });
      }
    } else {
       toast({ variant: "destructive", title: "Webcam Not Supported", description: "Your browser does not support webcam access."});
    }
  };

  const stopWebcam = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsWebcamOn(false);
    setHasCameraPermission(null);
    toast({ title: "Webcam stopped" });
  };

  const captureFromWebcam = () => {
    if (videoRef.current && canvasRef.current && isWebcamOn) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setImageDataUri(dataUri);
        setImagePreview(dataUri);
        setResults(null);
        setEditableItems([]);
        setError(null);
        stopWebcam();
        toast({ title: "Image Captured!", description: "Ready for analysis."});
      }
    } else {
        toast({ variant: "destructive", title: "Capture Failed", description: "Webcam not active or component not ready."});
    }
  };

  const handleAnalyze = async () => {
    if (!imageDataUri) {
      setError("Please upload or capture an image first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResults(null);
    setEditableItems([]);

    const response = await analyzeArtSuppliesImage({ imageDataUri, userInstructions });
    if (response.success && response.data) {
      setResults(response.data);
      if (Array.isArray(response.data.recognizedItems)) {
        setEditableItems(JSON.parse(JSON.stringify(response.data.recognizedItems))); 
      } else {
        setEditableItems([]); 
      }
      toast({ title: "Analysis Complete", description: "Art supplies recognized." });
    } else {
      setError(response.error || "An unknown error occurred during analysis.");
      if (response.data) { 
        setResults(response.data); 
        if (Array.isArray(response.data.recognizedItems)) {
          setEditableItems(JSON.parse(JSON.stringify(response.data.recognizedItems)));
        } else {
          setEditableItems([]); 
        }
      }
      toast({ variant: "destructive", title: "Analysis Failed", description: response.error });
    }
    setIsLoading(false);
  };
  
  const clearImage = () => {
    setImageDataUri(null);
    setImagePreview(PLACEHOLDER_IMAGE);
    setFile(null);
    setResults(null);
    setEditableItems([]);
    setError(null);
    setUserInstructions(''); // Clear instructions as well
    if (isWebcamOn) stopWebcam();
    const fileInput = document.getElementById('art-image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleItemChange = (index: number, field: keyof RecognizedArtSupply, value: string | number) => {
    const updatedItems = [...editableItems];
    const currentItem = { ...updatedItems[index] };

    if (field === 'count') {
        const newCount = typeof value === 'string' ? parseInt(value, 10) : value;
        currentItem.count = isNaN(newCount) || newCount < 0 ? 0 : newCount;
    } else if (field === 'name') {
        currentItem.name = typeof value === 'string' ? value : String(value);
    }
    
    updatedItems[index] = currentItem;
    setEditableItems(updatedItems);
  };

  const handleSaveChanges = async () => {
    if (!editableItems || editableItems.length === 0) {
      toast({ variant: "destructive", title: "No Items", description: "No items to save to inventory." });
      return;
    }
    setIsLoadingSave(true);
    try {
      updateInventoryWithRecognizedItems(editableItems);
      toast({ title: "Inventory Updated", description: "Recognized items have been added/updated in your inventory." });
      if (results) {
        setResults(prevResults => prevResults ? {...prevResults, recognizedItems: [...editableItems]} : null);
      }

    } catch (e) {
      console.error("Failed to save to inventory:", e);
      toast({ variant: "destructive", title: "Save Failed", description: "Could not update inventory." });
    }
    setIsLoadingSave(false);
  };

  const handleCancelChanges = () => {
    if (results && Array.isArray(results.recognizedItems)) {
      setEditableItems(JSON.parse(JSON.stringify(results.recognizedItems))); 
      toast({ title: "Corrections Canceled", description: "Changes have been reverted to the last AI analysis." });
    } else if (results && typeof results.recognizedItems === 'string') {
        setEditableItems([]);
        toast({ title: "Corrections Canceled", description: "Original data was not in an editable format." });
    }
  };

  const canEditResults = results && Array.isArray(results.recognizedItems) && results.recognizedItems.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Art Supply Recognition</h1>
           {imageDataUri && (
            <Button variant="outline" onClick={clearImage} disabled={isLoading || isLoadingSave} className="mt-1 md:mt-0">
              <Eraser className="mr-2 h-5 w-5" /> Clear Image & Results
            </Button>
          )}
        </div>
         <p className="text-lg text-muted-foreground">
          Upload or capture an image of art supplies. The AI will identify each item and its count. You can then correct these findings and save them to your inventory. Use the optional instruction box to guide the AI.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'upload' | 'webcam')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2">
          <TabsTrigger value="upload" onClick={() => isWebcamOn && stopWebcam()}>
            <Upload className="mr-2 h-4 w-4"/> Upload Image
          </TabsTrigger>
          <TabsTrigger value="webcam">
            <Camera className="mr-2 h-4 w-4"/> Use Webcam
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Image</CardTitle>
              <CardDescription>Select an image file containing art supplies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="art-image-upload">Picture</Label>
                <Input id="art-image-upload" type="file" accept="image/*" onChange={handleFileChange} disabled={isLoading || isLoadingSave}/>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webcam">
          <Card>
            <CardHeader>
              <CardTitle>Webcam Capture</CardTitle>
              <CardDescription>Use your webcam to capture an image of art supplies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isWebcamOn ? (
                <Button onClick={startWebcam} disabled={isLoading || isLoadingSave}><Camera className="mr-2 h-5 w-5"/>Start Webcam</Button>
              ) : (
                <div className="space-y-2">
                  <Button onClick={stopWebcam} variant="outline" disabled={isLoading || isLoadingSave}>Stop Webcam</Button>
                  <Button onClick={captureFromWebcam} className="ml-2" disabled={isLoading || isLoadingSave}>Capture Photo</Button>
                </div>
              )}
              <div className="w-full aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
                {isWebcamOn ? (
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                ) : (
                  <Camera className="h-16 w-16 text-muted-foreground"/>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden"></canvas>
              {hasCameraPermission === false && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Webcam Access Denied</AlertTitle>
                  <AlertDescription>
                    Please enable camera permissions in your browser settings to use this feature.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {(imagePreview !== PLACEHOLDER_IMAGE || (isWebcamOn && activeTab === "webcam")) && (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Image Preview & Analysis Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {activeTab === 'upload' && imagePreview && imagePreview !== PLACEHOLDER_IMAGE && (
                    <div className="mb-4">
                         <Image src={imagePreview} alt="Art supplies preview" width={600} height={400} className="rounded-md object-contain max-h-[400px] w-auto mx-auto shadow-md" data-ai-hint="art supplies" />
                    </div>
                )}
                 {activeTab === 'webcam' && imagePreview && imagePreview !== PLACEHOLDER_IMAGE && !isWebcamOn && (
                    <div className="mb-4">
                         <Image src={imagePreview} alt="Captured art supplies" width={600} height={400} className="rounded-md object-contain max-h-[400px] w-auto mx-auto shadow-md" data-ai-hint="art supplies" />
                    </div>
                )}
                
                <div>
                  <Label htmlFor="user-instructions" className="flex items-center gap-2">
                    Optional Instructions for AI
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground">
                          <HelpCircle className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="text-sm">
                        Provide specific guidance to the AI, for example:
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>"Only count the blue paint tubes."</li>
                          <li>"Focus on the items on the top shelf."</li>
                          <li>"Ignore any pencils."</li>
                          <li>"Provide counts for brushes larger than 1 inch."</li>
                        </ul>
                      </PopoverContent>
                    </Popover>
                  </Label>
                  <Textarea
                    id="user-instructions"
                    value={userInstructions}
                    onChange={(e) => setUserInstructions(e.target.value)}
                    placeholder="e.g., 'Only count items on the top row', 'Just the red paint tubes'"
                    className="mt-1"
                    rows={3}
                    disabled={isLoading || isLoadingSave}
                  />
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleAnalyze} disabled={isLoading || isLoadingSave || !imageDataUri}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                    Analyze Supplies
                </Button>
            </CardFooter>
        </Card>
      )}


      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>Review and correct the AI's findings below. Click "Save to Inventory" to add/update these items in your main inventory.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 text-lg">Identified Items</h3>
              {canEditResults ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60%]">Art Supply Name</TableHead>
                      <TableHead className="text-right w-[30%]">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editableItems.map((item, index) => (
                      <TableRow key={`edit-${item.name}-${index}`}>
                        <TableCell>
                          <Input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                            className="h-8"
                            disabled={isLoadingSave}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={item.count}
                            onChange={(e) => handleItemChange(index, 'count', e.target.value)}
                            className="h-8 w-20 text-right"
                            min="0"
                            disabled={isLoadingSave}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : typeof results.recognizedItems === 'string' ? (
                 <div className="p-4 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground mb-2">Raw item data (AI output might be malformed and cannot be edited):</p>
                    <pre className="whitespace-pre-wrap text-xs">{results.recognizedItems}</pre>
                 </div>
              ) : (
                <p className="text-muted-foreground">No art supplies were confidently recognized in an editable format, or the data is in an unexpected format.</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-lg">AI Summary</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line bg-muted p-4 rounded-md">
                {results.analysisSummary || "No analysis summary provided."}
              </p>
            </div>
          </CardContent>
           {canEditResults && (
            <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancelChanges} disabled={isLoading || isLoadingSave}>
                    <XCircle className="mr-2 h-5 w-5" /> Cancel Corrections
                </Button>
                <Button onClick={handleSaveChanges} disabled={isLoading || isLoadingSave || editableItems.length === 0}>
                    {isLoadingSave ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                     Save to Inventory
                </Button>
            </CardFooter>
           )}
        </Card>
      )}
       <p className="text-xs text-muted-foreground mt-4">
        Note: AI-powered recognition is experimental. For critical inventory, always verify counts manually. New items added via recognition will have a default price of $0.00; please update this on the Inventory page.
      </p>
    </div>
  );
}
