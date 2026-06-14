import React from "react";
import { Listing } from "../../types";
import SeloWizard from "../SeloWizard";

interface SellerAddListingProps {
  onBack: () => void;
  onPublishSuccess: (newListing: Listing) => void;
  setToast: (toast: { message: string; subText?: string } | null) => void;
}

export default function SellerAddListing({
  onBack,
  onPublishSuccess,
  setToast
}: SellerAddListingProps) {
  return (
    <div className="animate-fadeIn">
      <SeloWizard 
        userRole="SELLER"
        onBack={onBack}
        onPublishSuccess={onPublishSuccess}
        onSpawnToast={setToast}
      />
    </div>
  );
}
