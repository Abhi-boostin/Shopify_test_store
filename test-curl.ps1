# PowerShell script to test Shopify Storefront API token
$shop = "test-store-1100000000000000000000000000000002096.myshopify.com"
$token = "0de9562e7ade2498e3d47d9b739635cb"

$headers = @{
    "Content-Type" = "application/json"
    "X-Shopify-Storefront-Access-Token" = $token
}

$body = @{
    query = "{ shop { name } }"
} | ConvertTo-Json

Write-Host "Testing Shopify Storefront API..." -ForegroundColor Cyan
Write-Host "Shop: $shop" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "https://$shop/api/2024-10/graphql.json" -Method Post -Headers $headers -Body $body
    
    if ($response.errors) {
        Write-Host "❌ UNAUTHORIZED - Token is invalid or missing permissions" -ForegroundColor Red
        Write-Host ""
        Write-Host "Response:" -ForegroundColor Yellow
        $response | ConvertTo-Json -Depth 10
        Write-Host ""
        Write-Host "ACTION REQUIRED:" -ForegroundColor Yellow
        Write-Host "1. Go to Shopify Admin → Settings → Apps and sales channels → Develop apps"
        Write-Host "2. Select your app (or create one)"
        Write-Host "3. Configuration tab → Enable Storefront API scopes:"
        Write-Host "   - unauthenticated_read_product_listings"
        Write-Host "   - unauthenticated_write_checkouts"
        Write-Host "4. Save → Go to API credentials tab → Install app"
        Write-Host "5. Copy the NEW Storefront access token"
    } elseif ($response.data) {
        Write-Host "✅ SUCCESS - Token is valid!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Shop Name: $($response.data.shop.name)" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your token is working correctly. Restart your dev server:" -ForegroundColor Cyan
        Write-Host "npm run dev" -ForegroundColor White
    }
} catch {
    Write-Host "❌ ERROR:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
