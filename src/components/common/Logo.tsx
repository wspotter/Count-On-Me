import Image from 'next/image';

export function Logo() {
  return (
    <div className="flex items-center p-1"> {/* Adjusted padding for better fit */}
      <Image
        src="/logo-the-printery.png" // Make sure you place your logo at public/logo-the-printery.png
        alt="The Printery Logo"
        width={125} // Approximate width based on image aspect ratio (original: 304px)
        height={50} // Approximate height based on image aspect ratio (original: 122px)
        priority // If the logo is above the fold, consider adding priority
        className="object-contain" // Ensures the image scales correctly
      />
    </div>
  );
}
