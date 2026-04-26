import React from "react";
import Link from "next/link";
import { FundingDTO } from "@/lib/actions/funding.actions";
import { Calendar, MapPin, TrendingUp, BadgeCheck } from "lucide-react";

interface FundingCardProps {
  funding: FundingDTO;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
  PARTIALLY_FUNDED: "bg-blue-100 text-blue-700",
};

const FundingCard: React.FC<FundingCardProps> = ({ funding }) => {
  const fmt = (n: number, cur = "USD") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: cur, notation: "compact" }).format(n);

  const daysUntilClose = funding.expectedClosingDate
    ? Math.ceil((new Date(funding.expectedClosingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="bg-white border border-green-200 rounded-xl shadow-md p-6 flex flex-col justify-between hover:shadow-xl hover:border-green-400 transition-all duration-300">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="text-lg font-bold text-gray-900 leading-tight">{funding.companyName}</h2>
          <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[funding.status] ?? "bg-gray-100 text-gray-600"}`}>
            {funding.status.replace(/_/g, " ")}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
          <span className="bg-gray-100 px-2 py-0.5 rounded-full font-medium">
            {funding.fundingType.replace(/_/g, " ")}
          </span>
          {funding.fundingRound && (
            <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
              {funding.fundingRound}
            </span>
          )}
          {funding.isVerified && (
            <span className="flex items-center gap-0.5 text-green-600 font-medium">
              <BadgeCheck size={12} /> Verified
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-700">
          <TrendingUp size={14} className="text-green-500 shrink-0" />
          <span className="font-semibold text-green-600">
            {fmt(funding.fundingAmount, funding.currency)}
          </span>
        </div>

        {funding.industrySector && (
          <p className="text-sm text-gray-600">
            <span className="font-medium text-green-600">Sector:</span> {funding.industrySector}
          </p>
        )}

        {funding.companyLocation && (
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <MapPin size={13} className="text-green-500 shrink-0" />
            {funding.companyLocation}
          </div>
        )}

        {funding.leadInvestor && (
          <p className="text-sm text-gray-600">
            <span className="font-medium text-green-600">Lead:</span> {funding.leadInvestor}
          </p>
        )}

        {funding.expectedClosingDate && (
          <div className="flex items-center gap-1.5 text-sm">
            <Calendar size={13} className="text-green-500 shrink-0" />
            <span className={daysUntilClose != null && daysUntilClose <= 14 ? "text-red-500 font-medium" : "text-gray-600"}>
              Closes {new Date(funding.expectedClosingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              {daysUntilClose != null && daysUntilClose <= 30 && daysUntilClose > 0 && ` (${daysUntilClose}d left)`}
            </span>
          </div>
        )}

        {funding.fundingPurpose && (
          <p className="text-sm text-gray-500 line-clamp-2">{funding.fundingPurpose}</p>
        )}
      </div>

      {/* Action */}
      <Link
        href={`/human-services/dashboard/fundings/${funding.fundingId}`}
        className="mt-2 inline-block w-full text-center bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow hover:shadow-lg transition-all duration-300"
      >
        View Details
      </Link>
    </div>
  );
};

export default FundingCard;
