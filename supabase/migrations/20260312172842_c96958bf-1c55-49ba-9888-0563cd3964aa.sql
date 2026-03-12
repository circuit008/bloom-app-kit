
-- Create copyrighted_images table for known copyrighted image hashes
CREATE TABLE public.copyrighted_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_hash text NOT NULL,
  term text NOT NULL,
  owner text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  source_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.copyrighted_images ENABLE ROW LEVEL SECURITY;

-- Anyone can read copyrighted images (needed for comparison)
CREATE POLICY "Anyone can read copyrighted images"
  ON public.copyrighted_images FOR SELECT
  TO public
  USING (true);

-- Create uploaded_images table for user upload hashes
CREATE TABLE public.uploaded_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  image_hash text NOT NULL,
  upload_date timestamp with time zone NOT NULL DEFAULT now(),
  is_copyrighted boolean NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.uploaded_images ENABLE ROW LEVEL SECURITY;

-- Users can insert their own uploads
CREATE POLICY "Users can insert own uploads"
  ON public.uploaded_images FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own uploads
CREATE POLICY "Users can read own uploads"
  ON public.uploaded_images FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Seed 50+ known copyrighted image hashes (simulated perceptual hashes)
INSERT INTO public.copyrighted_images (image_hash, term, owner, category, source_url) VALUES
  ('a1b2c3d4e5f60001', 'Mickey Mouse', 'Disney', 'character', 'https://disney.com'),
  ('a1b2c3d4e5f60002', 'Donald Duck', 'Disney', 'character', 'https://disney.com'),
  ('a1b2c3d4e5f60003', 'Goofy', 'Disney', 'character', 'https://disney.com'),
  ('a1b2c3d4e5f60004', 'Minnie Mouse', 'Disney', 'character', 'https://disney.com'),
  ('a1b2c3d4e5f60005', 'Elsa (Frozen)', 'Disney', 'character', 'https://disney.com'),
  ('a1b2c3d4e5f60006', 'Simba (Lion King)', 'Disney', 'character', 'https://disney.com'),
  ('a1b2c3d4e5f60007', 'Buzz Lightyear', 'Disney/Pixar', 'character', 'https://disney.com'),
  ('a1b2c3d4e5f60008', 'Spider-Man', 'Marvel/Disney', 'character', 'https://marvel.com'),
  ('a1b2c3d4e5f60009', 'Iron Man', 'Marvel/Disney', 'character', 'https://marvel.com'),
  ('a1b2c3d4e5f60010', 'Captain America Shield', 'Marvel/Disney', 'logo', 'https://marvel.com'),
  ('a1b2c3d4e5f60011', 'Hulk', 'Marvel/Disney', 'character', 'https://marvel.com'),
  ('a1b2c3d4e5f60012', 'Thor Hammer', 'Marvel/Disney', 'symbol', 'https://marvel.com'),
  ('a1b2c3d4e5f60013', 'Black Panther', 'Marvel/Disney', 'character', 'https://marvel.com'),
  ('a1b2c3d4e5f60014', 'Deadpool', 'Marvel/Disney', 'character', 'https://marvel.com'),
  ('a1b2c3d4e5f60015', 'Nike Swoosh', 'Nike Inc.', 'logo', 'https://nike.com'),
  ('a1b2c3d4e5f60016', 'Air Jordan Jumpman', 'Nike Inc.', 'logo', 'https://nike.com'),
  ('a1b2c3d4e5f60017', 'Adidas Three Stripes', 'Adidas AG', 'logo', 'https://adidas.com'),
  ('a1b2c3d4e5f60018', 'Adidas Trefoil', 'Adidas AG', 'logo', 'https://adidas.com'),
  ('a1b2c3d4e5f60019', 'Apple Logo', 'Apple Inc.', 'logo', 'https://apple.com'),
  ('a1b2c3d4e5f60020', 'Google Logo', 'Google LLC', 'logo', 'https://google.com'),
  ('a1b2c3d4e5f60021', 'Batman Symbol', 'DC Comics/Warner Bros.', 'logo', 'https://dc.com'),
  ('a1b2c3d4e5f60022', 'Superman S', 'DC Comics/Warner Bros.', 'logo', 'https://dc.com'),
  ('a1b2c3d4e5f60023', 'Wonder Woman', 'DC Comics/Warner Bros.', 'character', 'https://dc.com'),
  ('a1b2c3d4e5f60024', 'Pikachu', 'Nintendo/The Pokémon Company', 'character', 'https://pokemon.com'),
  ('a1b2c3d4e5f60025', 'Mario', 'Nintendo', 'character', 'https://nintendo.com'),
  ('a1b2c3d4e5f60026', 'Link (Zelda)', 'Nintendo', 'character', 'https://nintendo.com'),
  ('a1b2c3d4e5f60027', 'Sonic the Hedgehog', 'Sega', 'character', 'https://sega.com'),
  ('a1b2c3d4e5f60028', 'Hello Kitty', 'Sanrio', 'character', 'https://sanrio.com'),
  ('a1b2c3d4e5f60029', 'Spongebob', 'Nickelodeon/Paramount', 'character', 'https://nick.com'),
  ('a1b2c3d4e5f60030', 'Peppa Pig', 'Hasbro/eOne', 'character', 'https://peppapig.com'),
  ('a1b2c3d4e5f60031', 'Coca-Cola Logo', 'The Coca-Cola Company', 'logo', 'https://coca-cola.com'),
  ('a1b2c3d4e5f60032', 'Pepsi Globe', 'PepsiCo', 'logo', 'https://pepsi.com'),
  ('a1b2c3d4e5f60033', 'McDonald''s Golden Arches', 'McDonald''s Corp.', 'logo', 'https://mcdonalds.com'),
  ('a1b2c3d4e5f60034', 'Starbucks Siren', 'Starbucks Corp.', 'logo', 'https://starbucks.com'),
  ('a1b2c3d4e5f60035', 'Ferrari Prancing Horse', 'Ferrari N.V.', 'logo', 'https://ferrari.com'),
  ('a1b2c3d4e5f60036', 'Louis Vuitton Monogram', 'LVMH', 'pattern', 'https://louisvuitton.com'),
  ('a1b2c3d4e5f60037', 'Gucci GG Pattern', 'Kering/Gucci', 'pattern', 'https://gucci.com'),
  ('a1b2c3d4e5f60038', 'Chanel CC Logo', 'Chanel S.A.', 'logo', 'https://chanel.com'),
  ('a1b2c3d4e5f60039', 'Supreme Box Logo', 'Supreme', 'logo', 'https://supremenewyork.com'),
  ('a1b2c3d4e5f60040', 'Star Wars Logo', 'Lucasfilm/Disney', 'logo', 'https://starwars.com'),
  ('a1b2c3d4e5f60041', 'Darth Vader', 'Lucasfilm/Disney', 'character', 'https://starwars.com'),
  ('a1b2c3d4e5f60042', 'Baby Yoda (Grogu)', 'Lucasfilm/Disney', 'character', 'https://starwars.com'),
  ('a1b2c3d4e5f60043', 'Harry Potter Logo', 'Warner Bros.', 'logo', 'https://wizardingworld.com'),
  ('a1b2c3d4e5f60044', 'Hogwarts Crest', 'Warner Bros.', 'logo', 'https://wizardingworld.com'),
  ('a1b2c3d4e5f60045', 'Naruto', 'Shueisha/VIZ Media', 'character', 'https://naruto.com'),
  ('a1b2c3d4e5f60046', 'Goku (Dragon Ball)', 'Toei Animation/Shueisha', 'character', 'https://dragonball.com'),
  ('a1b2c3d4e5f60047', 'One Piece Jolly Roger', 'Toei Animation/Shueisha', 'logo', 'https://onepiece.com'),
  ('a1b2c3d4e5f60048', 'Puma Logo', 'Puma SE', 'logo', 'https://puma.com'),
  ('a1b2c3d4e5f60049', 'Under Armour Logo', 'Under Armour Inc.', 'logo', 'https://underarmour.com'),
  ('a1b2c3d4e5f60050', 'Versace Medusa', 'Versace/Capri Holdings', 'logo', 'https://versace.com'),
  ('a1b2c3d4e5f60051', 'Playboy Bunny', 'PLBY Group', 'logo', 'https://playboy.com'),
  ('a1b2c3d4e5f60052', 'Rolling Stones Tongue', 'Musidor B.V.', 'logo', 'https://rollingstones.com'),
  ('a1b2c3d4e5f60053', 'Transformers Logo', 'Hasbro', 'logo', 'https://transformers.com'),
  ('a1b2c3d4e5f60054', 'Minecraft Creeper', 'Mojang/Microsoft', 'character', 'https://minecraft.net'),
  ('a1b2c3d4e5f60055', 'Roblox Logo', 'Roblox Corp.', 'logo', 'https://roblox.com');
