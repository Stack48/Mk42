import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclut @aws-sdk du bundle — chargé uniquement si STORAGE_DRIVER=s3 en production
  serverExternalPackages: ["@aws-sdk/client-s3", "@aws-sdk/s3-request-presigner", "@react-pdf/renderer"],
};

export default nextConfig;
