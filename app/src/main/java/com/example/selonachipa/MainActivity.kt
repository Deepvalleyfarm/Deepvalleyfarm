package com.example.selonachipa

import android.os.Bundle
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF050506) // Very dark background matching the mock-up
                ) {
                    var webViewUrl by remember { mutableStateOf<String?>("https://ais-pre-hes63u67hy33o4p2nwlgzv-866799298460.europe-west2.run.app") }

                    if (webViewUrl != null) {
                        WebViewScreen(url = webViewUrl!!, onBackToRoles = { webViewUrl = null })
                    } else {
                        RoleSelectionScreen(onNavigateToWeb = { role ->
                            webViewUrl = "https://ais-pre-hes63u67hy33o4p2nwlgzv-866799298460.europe-west2.run.app/?role=${role.name}"
                        })
                    }
                }
            }
        }
    }
}

@Composable
fun WebViewScreen(url: String, onBackToRoles: () -> Unit) {
    var webView: WebView? by remember { mutableStateOf(null) }

    // Intercept hardware or software back button to steer inside WebView history gracefully
    BackHandler(enabled = true) {
        if (webView?.canGoBack() == true) {
            webView?.goBack()
        } else {
            onBackToRoles()
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        AndroidView(
            factory = { context ->
                WebView(context).apply {
                    layoutParams = ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )
                    webViewClient = object : WebViewClient() {
                        override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                            if (url != null) {
                                view?.loadUrl(url)
                            }
                            return true
                        }
                    }
                    webChromeClient = WebChromeClient()

                    // Grant optimal modern settings for full hybrid application rendering
                    settings.javaScriptEnabled = true
                    settings.domStorageEnabled = true
                    settings.databaseEnabled = true
                    settings.loadsImagesAutomatically = true
                    settings.useWideViewPort = true
                    settings.loadWithOverviewMode = true
                    settings.mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE

                    loadUrl(url)
                    webView = this
                }
            },
            update = { view ->
                // WebView keeps the layout instance
            },
            modifier = Modifier.fillMaxSize()
        )
    }
}

enum class UserRole {
    BUYER, SELLER, AGENT, RIDER
}

@Composable
fun RoleSelectionScreen(onNavigateToWeb: (UserRole) -> Unit) {
    val context = LocalContext.current
    var selectedRole by remember { mutableStateOf(UserRole.BUYER) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF050506))
            .padding(horizontal = 24.dp, vertical = 20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // 1. TOP HEADER STATUS BAR SHARD
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 10.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "SELONACHIPA SETUP",
                style = MaterialTheme.typography.labelSmall.copy(
                    color = Color(0xFF6B7280),
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
            )

            // Progress bar dots
            Row(
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // First active rectangle
                Box(
                    modifier = Modifier
                        .size(height = 4.dp, width = 18.dp)
                        .clip(RoundedCornerShape(2.dp))
                        .background(Color(0xFF6366F1)) // Active purple indicator
                )
                // Other 6 muted indicators
                repeat(6) {
                    Box(
                        modifier = Modifier
                            .size(height = 4.dp, width = 12.dp)
                            .clip(RoundedCornerShape(2.dp))
                            .background(Color(0xFF1F2937)) // Dark muted dots
                    )
                }
            }
        }

        // 2. BRAND LOGO SECTION
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(vertical = 12.dp)
        ) {
            // Circle Orange Play button
            Box(
                modifier = Modifier
                    .size(72.dp)
                    .clip(CircleShape)
                    .background(Color(0xFFFFA500)) // Shiny bright orange
                    .clickable {
                        Toast.makeText(context, "SeloNaChipa: Watch video reels!", Toast.LENGTH_SHORT).show()
                    },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Filled.PlayArrow,
                    contentDescription = "Play button icon",
                    tint = Color.Black,
                    modifier = Modifier.size(36.dp).offset(x = 2.dp) // Offset slightly to visually center
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = "SeloNaChipa",
                fontSize = 28.sp,
                fontWeight = FontWeight.Black,
                color = Color(0xFFFFA500), // Distinct primary brand yellow-orange
                letterSpacing = 0.5.sp
            )

            Text(
                text = "Zambia's Interactive Short Video Marketplace",
                fontSize = 11.sp,
                color = Color(0xFF9CA3AF),
                fontWeight = FontWeight.Medium,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 4.dp)
            )
        }

        // 3. SELECTION CONTAINER
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f, fill = false),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Text(
                text = "Select Your Role",
                fontSize = 18.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color.White,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 6.dp),
                textAlign = TextAlign.Start
            )

            // Dynamic Role Option Cards
            RoleOptionCard(
                role = UserRole.BUYER,
                isSelected = selectedRole == UserRole.BUYER,
                title = "Buyer",
                description = "Watch rich product video reels & buy cheap items instantly in Zambia",
                icon = Icons.Filled.Favorite,
                themeColor = Color(0xFFFFA500),
                onClick = { selectedRole = UserRole.BUYER }
            )

            RoleOptionCard(
                role = UserRole.SELLER,
                isSelected = selectedRole == UserRole.SELLER,
                title = "Seller / Shop Owner",
                description = "List items by recording 15-60s short product videos",
                icon = Icons.Filled.ShoppingBag,
                themeColor = Color(0xFFFFA500),
                onClick = { selectedRole = UserRole.SELLER }
            )

            RoleOptionCard(
                role = UserRole.AGENT,
                isSelected = selectedRole == UserRole.AGENT,
                title = "Local Selling Agent",
                description = "Manage seller listings & earn commissions",
                icon = Icons.Filled.Person,
                themeColor = Color(0xFFFFA500),
                onClick = { selectedRole = UserRole.AGENT }
            )

            RoleOptionCard(
                role = UserRole.RIDER,
                isSelected = selectedRole == UserRole.RIDER,
                title = "Ride with Selonachipa",
                description = "Deliver orders local to your city, build your tier, and grow your Social Fund",
                icon = Icons.Filled.LocalShipping,
                themeColor = Color(0xFF6366F1), // Purple tint card accent
                onClick = { selectedRole = UserRole.RIDER }
            )
        }

        // 4. ACTION BUTTON & LEGAL FOOTER
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Button(
                onClick = {
                    val roleLabel = when (selectedRole) {
                        UserRole.BUYER -> "Buyer account setup"
                        UserRole.SELLER -> "Seller store configuration"
                        UserRole.AGENT -> "Agent commission ledger"
                        UserRole.RIDER -> "Courier dispatcher grid joining"
                    }
                    Toast.makeText(context, "$roleLabel is initialized in the backend ledger system.", Toast.LENGTH_LONG).show()
                    onNavigateToWeb(selectedRole)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF6366F1) // Action core button color
                ),
                shape = RoundedCornerShape(14.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = "Continue Setup",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Icon(
                        imageVector = Icons.Filled.ArrowForward,
                        contentDescription = "Right Arrow",
                        tint = Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = "By continuing you link securely with Zambia Mobile Money regulations & agree to our Terms of Use.",
                fontSize = 9.sp,
                color = Color(0xFF4B5563),
                textAlign = TextAlign.Center,
                lineHeight = 13.sp,
                modifier = Modifier.padding(horizontal = 16.dp)
            )
        }
    }
}

@Composable
fun RoleOptionCard(
    role: UserRole,
    isSelected: Boolean,
    title: String,
    description: String,
    icon: ImageVector,
    themeColor: Color,
    onClick: () -> Unit
) {
    val borderColor = if (isSelected) themeColor else Color(0xFF1F2937)
    val cardBackground = Color(0xFF0F1115) // Deep item card base color

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(cardBackground)
            .border(
                width = if (isSelected) 1.5.dp else 1.dp,
                color = borderColor,
                shape = RoundedCornerShape(16.dp)
            )
            .clickable(onClick = onClick)
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Icon container
        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(CircleShape)
                .background(themeColor.copy(alpha = 0.1f))
                .border(1.dp, themeColor.copy(alpha = 0.2f), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = "$title icon marker",
                tint = themeColor,
                modifier = Modifier.size(20.dp)
            )
        }

        Spacer(modifier = Modifier.width(14.dp))

        // Content
        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = title,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = description,
                fontSize = 11.sp,
                color = Color(0xFF9CA3AF),
                lineHeight = 14.sp
            )
        }
    }
}
