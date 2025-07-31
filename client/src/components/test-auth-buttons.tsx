import { Button } from "@/components/ui/button";
import { FaGoogle, FaFacebook, FaGithub, FaTwitter } from "react-icons/fa";

export function SocialLoginButtons() {
  const handleSocialLogin = (provider: string) => {
    // Open OAuth popup window
    const popup = window.open(
      `/auth/${provider}`,
      `${provider}_login`,
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    // Listen for popup to close (indicates auth completion)
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        // Reload page to check for new auth state
        window.location.reload();
      }
    }, 1000);
  };

  const resetAuth = () => {
    localStorage.clear();
    window.location.href = '/auth/logout';
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col space-y-3 z-50 bg-white p-4 rounded-lg border shadow-lg">
      <p className="text-sm font-medium text-neutral-700 mb-2">Sign In With:</p>
      
      <Button
        onClick={() => handleSocialLogin('google')}
        size="sm"
        className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white"
      >
        <FaGoogle />
        <span>Google</span>
      </Button>
      
      <Button
        onClick={() => handleSocialLogin('facebook')}
        size="sm"
        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
      >
        <FaFacebook />
        <span>Facebook</span>
      </Button>
      
      <Button
        onClick={() => handleSocialLogin('github')}
        size="sm"
        className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-900 text-white"
      >
        <FaGithub />
        <span>GitHub</span>
      </Button>
      
      <Button
        onClick={() => handleSocialLogin('twitter')}
        size="sm"
        className="flex items-center space-x-2 bg-blue-400 hover:bg-blue-500 text-white"
      >
        <FaTwitter />
        <span>Twitter</span>
      </Button>

      <div className="border-t pt-2">
        <Button
          onClick={resetAuth}
          size="sm"
          variant="outline"
          className="text-xs w-full"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}