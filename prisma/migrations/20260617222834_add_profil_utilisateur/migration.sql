-- CreateEnum
CREATE TYPE "ProfilUtilisateur" AS ENUM ('particulier', 'professionnel', 'entreprise');

-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "profil" "ProfilUtilisateur";
