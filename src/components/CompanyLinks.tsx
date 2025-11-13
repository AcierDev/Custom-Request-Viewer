"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Eye,
  Copy,
  Check,
  ExternalLink,
  Mail,
  Clock,
  MapPin,
  ChevronDown,
  Share2,
  ShoppingBag,
} from "lucide-react";

interface SharedDesignData {
  shareId: string;
  designData: Record<string, unknown>;
  createdAt: string;
  accessCount: number;
}

interface CompanyLinksProps {
  sharedDesign?: SharedDesignData | null;
  selectedDesign?: string;
  dimensions?: { width: number; height: number };
  colorPattern?: string;
  onCopyLink?: () => void;
  copied?: boolean;
}

const links = [
  {
    name: "Etsy Shop",
    url: "https://everwoodus.etsy.com",
    icon: <img src="/images/etsy-icon.svg" alt="Etsy" className="w-4 h-4" />,
  },
  {
    name: "Purchase Directly",
    url: "https://everwood.shop",
    icon: <ShoppingBag className="w-4 h-4" />,
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/profile.php?id=61552868061643",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/everwoodus/",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
];

const contactInfo = [
  {
    icon: <Mail className="w-4 h-4" />,
    label: "Email",
    value: "team@everwoodus.com",
    href: "mailto:team@everwoodus.com",
  },
  {
    icon: <Clock className="w-4 h-4" />,
    label: "Hours",
    value: "Sun-Thur: 9AM-7:30PM",
  },
  {
    icon: <MapPin className="w-4 h-4" />,
    label: "Location",
    value: "1111 Mary Crest Rd",
    href: "https://maps.app.goo.gl/31prL6G23b8MSUxk8",
  },
];

export function CompanyLinks({
  sharedDesign,
  selectedDesign,
  dimensions,
  colorPattern,
  onCopyLink,
  copied = false,
}: CompanyLinksProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed top-20 left-6 z-50 max-w-sm space-y-3">
      {/* Company Links */}
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-xl overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-6 flex items-center justify-between hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-500/10 dark:bg-gray-400/10 flex items-center justify-center">
              <ExternalLink className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Everwood
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        <div
          className={`transition-all duration-300 ease-out ${
            isExpanded ? "max-h-100 opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          <div className="px-6 pb-6 space-y-1">
            {/* Store Links */}
            <div className="space-y-1">
              {links.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors group"
                >
                  <div className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    {link.icon}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    {link.name}
                  </span>
                  <ExternalLink className="w-3 h-3 text-gray-400 dark:text-gray-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>

            {/* Contact Info */}
            <div className="pt-3 border-t border-gray-200/50 dark:border-white/10 space-y-1">
              {contactInfo.map((info) => (
                <div key={info.label}>
                  {info.href ? (
                    <a
                      href={info.href}
                      target={
                        info.href.startsWith("mailto") ? undefined : "_blank"
                      }
                      rel={
                        info.href.startsWith("mailto")
                          ? undefined
                          : "noopener noreferrer"
                      }
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors group"
                    >
                      <div className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {info.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                          {info.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {info.value}
                        </div>
                      </div>
                      {info.href.startsWith("http") && (
                        <ExternalLink className="w-3 h-3 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 p-3">
                      <div className="text-gray-600 dark:text-gray-400">
                        {info.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {info.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {info.value}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Shared Design Info */}
      {sharedDesign && (
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Shared Design
            </h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(sharedDesign.createdAt)}</span>
            </div>

            {/* <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Eye className="w-3.5 h-3.5" />
              <span>{sharedDesign.accessCount} views</span>
            </div> */}

            {selectedDesign && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Design:
                </span>
                <Badge variant="secondary" className="text-xs">
                  {selectedDesign}
                </Badge>
              </div>
            )}

            {dimensions && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Size:
                </span>
                <Badge variant="outline" className="text-xs">
                  {dimensions.width * 3}" × {dimensions.height * 3}"
                </Badge>
              </div>
            )}

            {colorPattern && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Pattern:
                </span>
                <Badge variant="outline" className="text-xs">
                  {colorPattern}
                </Badge>
              </div>
            )}
          </div>

          {onCopyLink && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCopyLink}
              className="w-full mt-4 bg-white/50 dark:bg-white/5 border-white/20 dark:border-white/10 hover:bg-white/70 dark:hover:bg-white/10"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 mr-2" />
              ) : (
                <Copy className="w-3.5 h-3.5 mr-2" />
              )}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
