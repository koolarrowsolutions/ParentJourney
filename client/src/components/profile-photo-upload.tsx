import { useState } from "react";
import { ObjectUploader } from "./ObjectUploader";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UploadResult } from "@uppy/core";

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoUpdate: (photoUrl: string) => void;
  profileName: string;
  isChild?: boolean;
}

export function ProfilePhotoUpload({ 
  currentPhotoUrl, 
  onPhotoUpdate, 
  profileName,
  isChild = false 
}: ProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleGetUploadParameters = async () => {
    const response = await fetch('/api/objects/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to get upload URL');
    }
    
    const { uploadURL } = await response.json();
    return {
      method: 'PUT' as const,
      url: uploadURL,
    };
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    setIsUploading(true);
    
    try {
      const uploadedFile = result.successful[0];
      if (uploadedFile?.uploadURL) {
        // Update the profile with the new photo URL
        const response = await fetch('/api/profile-images', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageURL: uploadedFile.uploadURL,
          }),
        });

        if (response.ok) {
          const { objectPath } = await response.json();
          onPhotoUpdate(objectPath);
          
          toast({
            title: "Photo Updated!",
            description: `${profileName}'s profile photo has been updated successfully.`,
          });
        } else {
          throw new Error('Failed to update profile photo');
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading the photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
          <AvatarImage 
            src={currentPhotoUrl} 
            alt={`${profileName}'s photo`}
            className="object-cover"
          />
          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-lg font-semibold">
            {getInitials(profileName)}
          </AvatarFallback>
        </Avatar>
        
        <div className="absolute -bottom-2 -right-2">
          <ObjectUploader
            maxNumberOfFiles={1}
            maxFileSize={5242880} // 5MB
            onGetUploadParameters={handleGetUploadParameters}
            onComplete={handleUploadComplete}
            buttonClassName="h-8 w-8 rounded-full p-0 bg-primary hover:bg-primary/90 shadow-lg"
          >
            <Camera className="h-4 w-4 text-white" />
          </ObjectUploader>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-sm font-medium text-neutral-700">{profileName}</p>
        <p className="text-xs text-neutral-500">
          {isChild ? "Child Profile" : "Parent Profile"}
        </p>
      </div>
      
      {isUploading && (
        <div className="text-xs text-blue-600 animate-pulse">
          Updating photo...
        </div>
      )}
    </div>
  );
}