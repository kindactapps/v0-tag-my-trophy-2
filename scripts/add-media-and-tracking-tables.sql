-- Add media storage table for photos/videos
CREATE TABLE IF NOT EXISTS media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
    file_size INTEGER,
    mime_type TEXT,
    caption TEXT,
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add QR code scan tracking
CREATE TABLE IF NOT EXISTS qr_scans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
    qr_slug TEXT NOT NULL,
    scanned_by UUID REFERENCES profiles(id),
    scan_location JSONB, -- Store GPS coordinates, address, etc.
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trophy tagging events
CREATE TABLE IF NOT EXISTS trophy_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
    tagged_by UUID REFERENCES profiles(id),
    tag_location JSONB, -- GPS, venue name, etc.
    tag_notes TEXT,
    media_ids UUID[], -- Array of media IDs associated with this tag
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_inventory_id ON media(inventory_id);
CREATE INDEX IF NOT EXISTS idx_media_file_type ON media(file_type);
CREATE INDEX IF NOT EXISTS idx_qr_scans_inventory_id ON qr_scans(inventory_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_slug ON qr_scans(qr_slug);
CREATE INDEX IF NOT EXISTS idx_trophy_tags_inventory_id ON trophy_tags(inventory_id);
CREATE INDEX IF NOT EXISTS idx_trophy_tags_tagged_by ON trophy_tags(tagged_by);

-- Enable Row Level Security
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE trophy_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for media
CREATE POLICY "Users can view all media" ON media FOR SELECT USING (true);
CREATE POLICY "Users can upload media" ON media FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Users can update their own media" ON media FOR UPDATE USING (auth.uid() = uploaded_by);
CREATE POLICY "Users can delete their own media" ON media FOR DELETE USING (auth.uid() = uploaded_by);

-- RLS Policies for QR scans (public read, authenticated write)
CREATE POLICY "Anyone can view QR scans" ON qr_scans FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create QR scans" ON qr_scans FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for trophy tags
CREATE POLICY "Users can view all trophy tags" ON trophy_tags FOR SELECT USING (true);
CREATE POLICY "Users can create trophy tags" ON trophy_tags FOR INSERT WITH CHECK (auth.uid() = tagged_by);
CREATE POLICY "Users can update their own trophy tags" ON trophy_tags FOR UPDATE USING (auth.uid() = tagged_by);
CREATE POLICY "Users can delete their own trophy tags" ON trophy_tags FOR DELETE USING (auth.uid() = tagged_by);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trophy_tags_updated_at BEFORE UPDATE ON trophy_tags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
