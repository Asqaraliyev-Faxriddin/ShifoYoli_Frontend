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
  Snackbar,
  Alert,
  Pagination,
  Divider,
} from "@mui/material";
import { Add, Remove, Search, Groups } from "@mui/icons-material";

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
  type: "CREDIT" | "DEBIT";
  source: string;
  createdAt: string;
  wallet?: Wallet;
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
  const [actionType, setActionType] = useState<
    "add" | "deduct" | "massAdd" | "massDeduct"
  >("add");
  const [openDialog, setOpenDialog] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [usersList, setUsersList] = useState<User[]>([]);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info",
  });

  const Base_url = "https://faxriddin.bobur-dev.uz"

  const limit = 10;
  const totalPages = Math.ceil(total / limit);
  const uzMonths = ["Yan", "Fev", "Mart", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];

  // Profilni olish
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const { data } = await axios.get<{ data: User }>(
          `${Base_url}/profile/my/profile`,
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
        const offset = (page - 1) * limit;
        let url =
          user.role === "SUPERADMIN"
            ? `${Base_url}/payment/search?limit=${limit}&offset=${offset}`
            : `${Base_url}/payment/Payment/user?limit=${limit}&offset=${offset}`;
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

  // Kimga to‘lov qilinadi (individual)
  const handleRoleSelect = async () => {
    if (!selectedRole) return;
    try {
      const token = localStorage.getItem("accessToken");
      let url = "";
      if (selectedRole === "Adminlar")
        url = `${Base_url}/admin/admins`
      else if (selectedRole === "Shifokorlar")
        url = `${Base_url}/admin/doctors`;
      else if (selectedRole === "Bemorlar")
        url = `${Base_url}/admin/patients`;

      const { data } = await axios.get<{ data: User[] }>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsersList(data.data);
      setStep(2);
    } catch {
      setSnackbar({
        open: true,
        message: "Foydalanuvchilarni olishda xatolik!",
        severity: "error",
      });
    }
  };

  // To‘lov yoki ayirish (individual)
  const handleWalletAction = async () => {
    if (!selectedUserId || !amountInput) {
      setSnackbar({
        open: true,
        message: "Iltimos, barcha maydonlarni to‘ldiring!",
        severity: "error",
      });
      return;
    }
    try {
      const token = localStorage.getItem("accessToken");
      const url = `${Base_url}/admin/wallet/${actionType}`;
      const amount =
        actionType === "deduct"
          ? -Math.abs(Number(amountInput))
          : Math.abs(Number(amountInput));
      await axios.post(
        url,
        { userId: selectedUserId, amount },
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
    } catch {
      setSnackbar({
        open: true,
        message: "❌ Xatolik yuz berdi!",
        severity: "error",
      });
    }
  };

  interface RoleMap {
    Adminlar: "ADMIN";
    Shifokorlar: "DOCTOR";
    Bemorlar: "BEMOR";
  }
  


  // Umumiy (mass) to‘lov yoki ayirish

  type RoleKey = keyof RoleMap; // "Adminlar" | "Shifokorlar" | "Bemorlar"
  

  
  const handleMassAction = async () => {
    if (!selectedRole || !amountInput || !title || !message) {
      setSnackbar({
        open: true,
        message: "Iltimos, barcha maydonlarni to‘ldiring!",
        severity: "error",
      });
      return;
    }
  
    try {
      const token = localStorage.getItem("accessToken");
      const roleMap: RoleMap = {
        Adminlar: "ADMIN",
        Shifokorlar: "DOCTOR",
        Bemorlar: "BEMOR",
      };
  
      const url = `${Base_url}/admin/wallet/mass/${
        actionType === "massAdd" ? "add" : "deduct"
      }`;
  
      const amount =
        actionType === "massDeduct"
          ? -Math.abs(Number(amountInput))
          : Math.abs(Number(amountInput));
  
      await axios.post(
        url,
        { role: roleMap[selectedRole as RoleKey], amount, title, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setSnackbar({
        open: true,
        message: "✅ Umumiy amal bajarildi!",
        severity: "success",
      });
      setOpenDialog(false);
      setAmountInput("");
      setMessage("");
      setTitle("");
      setSelectedRole("");
    } catch {
      setSnackbar({
        open: true,
        message: "❌ Xatolik yuz berdi!",
        severity: "error",
      });
    }
  };
  
  const renderAmount = (p: Payment) => {
    const isDebit = p.type === "DEBIT";
    const color = isDebit ? "error.main" : "success.main";
    const sign = isDebit ? "-" : "+";
    return (
      <Typography component="span" sx={{ color, fontWeight: 600 }}>
        {sign} {Number(p.amount).toLocaleString("uz-UZ")} so‘m
      </Typography>
    );
  };
  
  
  

  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.getDate()} ${uzMonths[d.getMonth()]} ${d.getFullYear()} ${d.getHours()}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        💳 To‘lovlar
      </Typography>

      {/* 🔍 Qidiruv va filterlar */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Ism/email qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: "gray" }} />,
          }}
          sx={{ backgroundColor: "#fafafa", borderRadius: 3,width: "300px" }}
        />
        <TextField
          type="date"
          label="Boshlanish"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          sx={{ width: "50%" }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          type="date"
          label="Tugash"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          sx = {{width: "50%"}}
          InputLabelProps={{ shrink: true }}
        />
      </Stack>

   {/* To‘lov qilish, ayirish va umumiy tugmalar */}
{(user?.role === "SUPERADMIN" || user?.role === "ADMIN") && (
  <Stack
    direction="row"
    spacing={2}
    sx={{
      mb: 4,
      flexWrap: "wrap",
      justifyContent: { xs: "center", sm: "flex-start" },
      gap: 2,
    }}
  >
    <Button
      startIcon={<Add />}
      variant="contained"
      sx={{
        backgroundColor: "#00bcd4",
        borderRadius: 3,
        width: { xs: "60%", sm: "auto" },
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
        width: { xs: "60%", sm: "auto" },
      }}
      onClick={() => {
        setActionType("deduct");
        setOpenDialog(true);
        setStep(1);
      }}
    >
      To‘lov ayirish
    </Button>

    <Button
      startIcon={<Groups />}
      variant="outlined"
      sx={{
        borderRadius: 3,
        width: { xs: "100%", sm: "auto" },
      }}
      onClick={() => {
        setActionType("massAdd");
        setOpenDialog(true);
        setStep(1);
      }}
    >
      Umumiy to‘lov qilish
    </Button>

    <Button
      startIcon={<Groups />}
      variant="outlined"
      color="error"
      sx={{
        borderRadius: 3,
        width: { xs: "100%", sm: "auto" },
      }}
      onClick={() => {
        setActionType("massDeduct");
        setOpenDialog(true);
        setStep(1);
      }}
    >
      Umumiy to‘lov ayirish
    </Button>
  </Stack>
)}

{/* Jadval */}
{loading ? (
  <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
    <CircularProgress />
  </Box>
) : payments.length === 0 ? (
  <Typography align="center" sx={{ mt: 4 }}>
    To‘lovlar topilmadi.
  </Typography>
) : (
  <>
    {/* Desktop table */}
    <TableContainer
      component={Paper}
      sx={{ display: { xs: "none", md: "block" } }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            {user?.role === "SUPERADMIN" && (
              <TableCell>Foydalanuvchi</TableCell>
            )}
            <TableCell>Miqdori</TableCell>
            <TableCell>Tipi</TableCell>
            <TableCell>Manba</TableCell>
            <TableCell>Vaqti</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {payments.map((p, i) => (
            <TableRow key={p.id}>
              <TableCell>{(page - 1) * limit + i + 1}</TableCell>
              {user?.role === "SUPERADMIN" && (
                <TableCell>
                  {p.wallet?.user
                    ? `${p.wallet.user.firstName} ${p.wallet.user.lastName} (${p.wallet.user.email})`
                    : "-"}
                </TableCell>
              )}
              <TableCell>{renderAmount(p)}</TableCell>
              <TableCell>
                {p.type === "DEBIT" ? "Chiqarildi" : "Kiritildi"}
              </TableCell>
              <TableCell>{p.source || "Naqd"}</TableCell>
              <TableCell>{formatDate(p.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>

    {/* Mobil uchun card-view */}
    <Stack spacing={2} sx={{ display: { xs: "flex", md: "none" } }}>
      {payments.map((p, i) => (
        <Paper
          key={p.id}
          elevation={2}
          sx={{
            p: 2,
            borderRadius: 2,
            borderLeft: `6px solid ${
              p.type === "DEBIT" ? "#f44336" : "#00c853"
            }`,
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            #{(page - 1) * limit + i + 1}
          </Typography>

          {user?.role === "SUPERADMIN" && (
            <Typography sx={{ fontWeight: 600 }}>
              👤{" "}
              {p.wallet?.user
                ? `${p.wallet.user.firstName} ${p.wallet.user.lastName}`
                : "—"}
            </Typography>
          )}

          <Typography>
            💰 <b>{renderAmount(p)}</b>
          </Typography>

          <Typography>
            🔁 {p.type === "DEBIT" ? "Chiqarildi" : "Kiritildi"}
          </Typography>

          <Typography>📦 {p.source || "Naqd"}</Typography>

          <Divider sx={{ my: 1 }} />

          <Typography variant="body2" color="text.secondary">
            🕒 {formatDate(p.createdAt)}
          </Typography>
        </Paper>
      ))}
    </Stack>
  </>
)}


      {/* Sahifalash */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, newPage) => setPage(newPage)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* 💳 Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {actionType.includes("mass")
            ? actionType === "massAdd"
              ? "Umumiy to‘lov qilish"
              : "Umumiy to‘lov ayirish"
            : step === 1
            ? "Kimlarga to‘lov qilasiz?"
            : actionType === "add"
            ? "Summani qo‘shish"
            : "Summani ayirish"}
        </DialogTitle>

        <DialogContent>
          {/* Umumiy (mass) */}
          {actionType.includes("mass") ? (
            <>
              <RadioGroup
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                sx={{ mb: 2 }}
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
              <TextField
                label="Miqdor (so‘m)"
                type="number"
                fullWidth
                sx={{ mb: 2 }}
                value={
                  actionType === "massDeduct" && !amountInput.startsWith("-")
                    ? `-${amountInput}`
                    : amountInput
                }
                onChange={(e) => setAmountInput(e.target.value)}
              />
              <TextField
                label="Sarlavha"
                fullWidth
                sx={{ mb: 2 }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <TextField
                label="Xabar matni"
                fullWidth
                multiline
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </>
          ) : step === 1 ? (
            <RadioGroup
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <FormControlLabel value="Adminlar" control={<Radio />} label="Adminlar" />
              <FormControlLabel value="Shifokorlar" control={<Radio />} label="Shifokorlar" />
              <FormControlLabel value="Bemorlar" control={<Radio />} label="Bemorlar" />
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
                    {u.firstName} {u.lastName} ({u.email})
                  </MenuItem>
                ))}
              </Select>
              <TextField
                label="Miqdor (so‘m)"
                type="number"
                fullWidth
                sx={{ mb: 2 }}
                value={
                  actionType === "deduct" && !amountInput.startsWith("-")
                    ? `-${amountInput}`
                    : amountInput
                }
                onChange={(e) => setAmountInput(e.target.value)}
              />
            </>
          )}
        </DialogContent>

        <DialogActions>
          {actionType.includes("mass") ? (
            <>
              <Button onClick={() => setOpenDialog(false)}>Bekor qilish</Button>
              <Button
                onClick={handleMassAction}
                variant="contained"
                color={actionType === "massAdd" ? "primary" : "error"}
              >
                {actionType === "massAdd" ? "To‘lov qilish" : "To‘lov ayirish"}
              </Button>
            </>
          ) : step === 1 ? (
            <>
              <Button onClick={() => setOpenDialog(false)}>Bekor qilish</Button>
              <Button
                variant="contained"
                onClick={handleRoleSelect}
                disabled={!selectedRole}
              >
                Davom etish
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setStep(1)}
                color="inherit"
                sx={{ mr: 1 }}
              >
                Orqaga
              </Button>
              <Button
                onClick={handleWalletAction}
                variant="contained"
                color={actionType === "add" ? "primary" : "error"}
              >
                {actionType === "add" ? "Qo‘shish" : "Ayirish"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
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
