import axios, { type AxiosInstance } from "axios";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:8080/" : "/";

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
});

const getAll = async (): Promise<Housing[]> => {
  const res = await apiClient.get("api/housings");
  return res.data;
};

const getHousing = async (housingId: string): Promise<Housing> => {
  const res = await apiClient.get(`api/housings/${housingId}`);
  return res.data;
};

const createHousing = async (
  housingData: CreateHousingBody
): Promise<Housing> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No token found");
  }
  const res = await apiClient.post("api/housings", housingData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

const housingService = {
  getAll,
  getHousing,
  createHousing,
  apiClient,
};

export default housingService;
