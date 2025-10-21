import { Button, Box, Typography, Container, IconButton } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useRouter } from 'next/navigation'
import React from 'react'

/**
 * Sozlamalar (Settings) sahifasi komponenti
 * Ushbu komponent sozlamalarga o'tish va orqaga qaytish tugmalarini 
 * responsiv va zamonaviy uslubda ko'rsatadi.
 */
function Sozlamalar() {
  
  // useRouter hook'ini ishlatish
  const router = useRouter()
  
  return (
    // Asosiy konteyner, sahifaning markazida joylashish va responsivlik uchun
    <Container 
      maxWidth="sm" 
      sx={{ 
        mt: 4, // Yuqoridan margin
        p: 3, // Ichki padding
        borderRadius: 2, // Boshqa uslub
        boxShadow: 3, // Chiroyli soya
        backgroundColor: 'background.paper', // Orqa fon rangi
        // Ekran balandligini to'liq egallash uchun markazlashtirish (agar kerak bo'lsa)
        // Agar bu faqat bir bo'lim bo'lsa, quyidagilar kerak emas:
        // display: 'flex', 
        // flexDirection: 'column', 
        // minHeight: '100vh', 
        // justifyContent: 'center',
      }}
    >
      
      {/* Sarlavha va Orqaga tugmasini joylashtirish uchun Box */}
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="space-between" 
        mb={3} // Pastdan margin
      >
        <Typography variant="h5" component="h1" fontWeight="bold" color="primary">
          Sozlamalar
        </Typography>

        {/* Orqaga qaytish tugmasi: router.back() funksiyasi ishlatilgan */}
        <IconButton 
          aria-label="orqaga" 
          onClick={() => router.back()} 
          color="primary"
          size="large"
          title="Orqaga qaytish"
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Typography variant="body1" align="center" mb={4} color="text.secondary">
        Profilingiz sozlamalarini boshqarish sahifasiga o'tish uchun quyidagi tugmani bosing.
      </Typography>

      {/* Tugmalar uchun markazlashtirilgan konteyner */}
      <Box 
        display="flex" 
        flexDirection="column" 
        gap={2} // Tugmalar orasidagi bo'shliq
      >
        
        {/* Sozlamalarga o'tish tugmasi */}
        <Button 
      onClick={() => router.push("/settings/user")} 
      variant="contained" 
      sx={{
        backgroundColor: '#1976d2',
        '&:hover': {
      backgroundColor: '#115293',
        },
        color: '#fff',
        textTransform: 'none',
      }}
    >
      Sozlamalarga o'tish
    </Button>

      </Box>
    </Container>
  )
}

// Komponent nomi katta harf bilan (React standartiga ko'ra)
export default Sozlamalar