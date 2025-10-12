"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  MenuItem,
  Select,
  useMediaQuery,
  Card,
  CardContent,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { Add, Remove, Search } from "@mui/icons-material";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "SUPERADMIN" | "ADMIN" | "BEMOR" | "DOCTOR";
}

interface Wallet {
  id: string;
  userId: string;
  balance: string;
  user?: User;
}

interface Payment {
  id: string;
  amount: string;
  type: string;
  createdAt: string;
  wallet?: Wallet;
  source: string;
}

interface PaymentsResponse {
  total: number;
  count: number;
  data: Payment[];
}

const Tolovlar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [actionType, setActionType] = useState<"add" | "deduct">("add");
  const [openDialog, setOpenDialog] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [usersList, setUsersList] = useState<User[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info",
  });
  const isMobile = useMediaQuery("(max-width:768px)");
  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  const uzMonths = [
    "Yan", "Fev", "Mart", "Apr", "May", "Iyun",
    "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"
  ];

  // Profilni olish
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const { data } = await axios.get<{ data: User }>(
          "https://faxriddin.bobur-dev.uz/profile/my/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(data.data);
      } catch {
        console.error("Profil topilmadi");
      }
    };
    fetchProfile();
  }, []);

  // To‘lovlarni olish
  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        let url =
          user.role === "SUPERADMIN"
            ? `https://faxriddin.bobur-dev.uz/payment/search?limit=${limit}&offset=${page}`
            : `https://faxriddin.bobur-dev.uz/payment/Payment/user?limit=${limit}&offset=${page}`;

        if (search) url += `&firstName=${search}&email=${search}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;

        const { data } = await axios.get<PaymentsResponse>(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPayments(data.data || []);
        setTotal(data.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [user, page, search, startDate, endDate]);

  // Kimga to‘lov qilinadi
  const handleRoleSelect = async () => {
    if (!selectedRole) return;
    try {
      const token = localStorage.getItem("accessToken");
      let url = "";
      if (selectedRole === "Adminlar")
        url = "https://faxriddin.bobur-dev.uz/admin/admins";
      else if (selectedRole === "Shifokorlar")
        url = "https://faxriddin.bobur-dev.uz/admin/doctors";
      else if (selectedRole === "Bemorlar")
        url = "https://faxriddin.bobur-dev.uz/admin/patients";

      const { data } = await axios.get<{ data: User[] }>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsersList(data.data);
      setStep(2);
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Foydalanuvchilarni olishda xatolik",
        severity: "error",
      });
    }
  };

  // Qo‘shish yoki ayirish
  const handleWalletAction = async () => {
    if (!selectedUserId || !amountInput) {
      setSnackbar({
        open: true,
        message: "Ma'lumotlarni to‘ldiring!",
        severity: "error",
      });
      return;
    }
    try {
      const token = localStorage.getItem("accessToken");
      const url = `https://faxriddin.bobur-dev.uz/admin/wallet/${actionType}`;
      await axios.post(
        url,
        { userId: selectedUserId, amount: Number(amountInput) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSnackbar({
        open: true,
        message: "✅ Amal muvaffaqiyatli bajarildi!",
        severity: "success",
      });
      setOpenDialog(false);
      setStep(1);
      setAmountInput("");
      setSelectedUserId("");
      setSelectedRole("");
    } catch (err) {
      setSnackbar({
        open: true,
        message: "❌ Xatolik yuz berdi!",
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        💳 To‘lovlar
      </Typography>

      {/* 🔍 Qidiruv va Sana filterlari */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <TextField
          placeholder="Ism yoki email orqali qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: "gray" }} />,
          }}
          sx={{
            backgroundColor: "#fafafa",
            borderRadius: 3,
          }}
        />
        <TextField
          type="date"
          label="Boshlanish"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          type="date"
          label="Tugash"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Stack>

      {/* Tugmalar */}
      {(user?.role === "SUPERADMIN" || user?.role === "ADMIN") && (
        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
          <Button
            startIcon={<Add />}
            variant="contained"
            sx={{
              backgroundColor: "#00bcd4",
              borderRadius: 3,
              px: 3,
              transition: "0.3s",
              "&:hover": { backgroundColor: "#0097a7" },
            }}
            onClick={() => {
              setActionType("add");
              setOpenDialog(true);
              setStep(1);
            }}
          >
            To‘lov qilish
          </Button>
          <Button
            startIcon={<Remove />}
            variant="contained"
            sx={{
              backgroundColor: "#f44336",
              borderRadius: 3,
              px: 3,
              transition: "0.3s",
              "&:hover": { backgroundColor: "#c62828" },
            }}
            onClick={() => {
              setActionType("deduct");
              setOpenDialog(true);
              setStep(1);
            }}
          >
            To‘lov ayirish
          </Button>
        </Stack>
      )}

      {/* Jadval yoki Kartalar */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : payments.length === 0 ? (
        <Typography align="center" sx={{ mt: 4 }}>
          To‘lovlar topilmadi.
        </Typography>
      ) : isMobile ? (
        <Stack spacing={2}>
          {payments.map((p, i) => (
            <Card key={p.id} sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  #{i + 1}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography>
                  <strong>Miqdori:</strong>{" "}
                  {Number(p.amount).toLocaleString("uz-UZ")} so‘m
                </Typography>
                <Typography>
                  <strong>Holati:</strong> Paid
                </Typography>
                <Typography>
                  <strong>To‘lov turi:</strong> {p.source || "Naqd"}
                </Typography>
                <Typography>
                  <strong>Vaqti:</strong>{" "}
                  {(() => {
                    const d = new Date(p.createdAt);
                    return `${d.getDate()} ${
                      uzMonths[d.getMonth()]
                    }, ${d.getFullYear()} ${d.getHours()}:${String(
                      d.getMinutes()
                    ).padStart(2, "0")}`;
                  })()}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                {user?.role === "SUPERADMIN" && <TableCell>Foydalanuvchi</TableCell>}
                <TableCell>Miqdori</TableCell>
                <TableCell>Holati</TableCell>
                <TableCell>To‘lov turi</TableCell>
                <TableCell>Vaqti</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((p, i) => (
                <TableRow key={p.id}>
                  <TableCell>{i + 1}</TableCell>
                  {user?.role === "SUPERADMIN" && (
                    <TableCell>
                      {p.wallet?.user
                        ? `${p.wallet.user.firstName} ${p.wallet.user.lastName}`
                        : "-"}
                    </TableCell>
                  )}
                  <TableCell>
                    {Number(p.amount).toLocaleString("uz-UZ")} so‘m
                  </TableCell>
                  <TableCell>Paid</TableCell>
                  <TableCell>{p.source || "Naqd"}</TableCell>
                  <TableCell>
                    {(() => {
                      const d = new Date(p.createdAt);
                      return `${d.getDate()} ${
                        uzMonths[d.getMonth()]
                      }, ${d.getFullYear()} ${d.getHours()}:${String(
                        d.getMinutes()
                      ).padStart(2, "0")}`;
                    })()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: { borderRadius: 3, p: 1, backdropFilter: "blur(5px)" },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {step === 1
            ? "Kimlarga to‘lov qilasiz?"
            : actionType === "add"
            ? "Summani qo‘shish"
            : "Summani ayirish"}
        </DialogTitle>

        <DialogContent>
          {step === 1 ? (
            <RadioGroup
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <FormControlLabel
                value="Adminlar"
                control={<Radio />}
                label="Adminlar"
              />
              <FormControlLabel
                value="Shifokorlar"
                control={<Radio />}
                label="Shifokorlar"
              />
              <FormControlLabel
                value="Bemorlar"
                control={<Radio />}
                label="Bemorlar"
              />
            </RadioGroup>
          ) : (
            <>
              <Select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                fullWidth
                displayEmpty
                sx={{ my: 2 }}
              >
                <MenuItem value="">Foydalanuvchini tanlang</MenuItem>
                {usersList.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.firstName} {u.lastName}
                  </MenuItem>
                ))}
              </Select>
              <TextField
                label="Miqdor (so'm)"
                type="number"
                fullWidth
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
              />
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Bekor qilish</Button>
          {step === 1 ? (
            <Button variant="contained" onClick={handleRoleSelect}>
              Keyingi
            </Button>
          ) : (
            <Button variant="contained" onClick={handleWalletAction}>
              Tasdiqlash
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Tolovlar;
