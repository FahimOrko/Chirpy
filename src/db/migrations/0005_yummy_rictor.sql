ALTER TABLE "users" ADD COLUMN "is_chirpy_red" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "chirps" DROP COLUMN "is_chirpy_red";