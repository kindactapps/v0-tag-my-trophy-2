import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DatabaseTestInstructions() {
  return (
    <div className="space-y-6">
      <Card className="bg-white border-[#e8ddd0]">
        <CardHeader>
          <CardTitle className="text-xl text-[#2c2c2c]">How to Test Your Database</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-[#2c2c2c]">Step 1: Connect Supabase</h3>
            <p className="text-[#666] text-sm">
              Go to Project Settings (gear icon in top right) and add your Supabase integration. This will automatically
              configure your environment variables.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-[#2c2c2c]">Step 2: Upload Schema</h3>
            <p className="text-[#666] text-sm">
              Run the complete database schema script in your Supabase SQL editor to create all required tables.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-[#2c2c2c]">Step 3: Run Test</h3>
            <p className="text-[#666] text-sm">
              Use the database test page to verify all tables are created and accessible.
            </p>
          </div>

          <div className="bg-[#f5f0e8] p-4 rounded-lg">
            <h4 className="font-medium text-[#2c2c2c] mb-2">Expected Tables:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-[#666]">
              <div>• profiles</div>
              <div>• qr_slugs</div>
              <div>• stories</div>
              <div>• memories</div>
              <div>• orders</div>
              <div>• order_items</div>
              <div>• packages</div>
              <div>• qr_inventory</div>
              <div>• csv_import_logs</div>
              <div>• stores</div>
              <div>• comments</div>
              <div>• privacy_settings</div>
              <div>• analytics_events</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
