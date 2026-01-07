import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useToast } from "../components/ui/use-toast";
import { nodeBackendService } from "../services/nodeBackendService";

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    customerId: "",
    make: "",
    model: "",
    year: "",
    lastServiceDate: "",
    warrantyEndDate: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchVehicles();
    fetchCustomers();
  }, [page, search]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await nodeBackendService.get(
        `/vehicles?page=${page}&limit=10&search=${search}`
      );
      setVehicles(response.vehicles);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch vehicles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await nodeBackendService.get("/customers?limit=1000");
      setCustomers(response.customers);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        year: formData.year ? Number(formData.year) : undefined,
        lastServiceDate: formData.lastServiceDate || undefined,
        warrantyEndDate: formData.warrantyEndDate || undefined
      };

      if (editingVehicle) {
        await nodeBackendService.put(`/vehicles/${editingVehicle._id}`, payload);
        toast({
          title: "Success",
          description: "Vehicle updated successfully",
        });
      } else {
        await nodeBackendService.post("/vehicles", payload);
        toast({
          title: "Success",
          description: "Vehicle created successfully",
        });
      }
      setDialogOpen(false);
      setEditingVehicle(null);
      resetForm();
      fetchVehicles();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save vehicle",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      customerId: vehicle.customerId._id || vehicle.customerId,
      make: vehicle.make || "",
      model: vehicle.model || "",
      year: vehicle.year || "",
      lastServiceDate: vehicle.lastServiceDate 
        ? new Date(vehicle.lastServiceDate).toISOString().split("T")[0] 
        : "",
      warrantyEndDate: vehicle.warrantyEndDate 
        ? new Date(vehicle.warrantyEndDate).toISOString().split("T")[0] 
        : ""
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    
    try {
      await nodeBackendService.delete(`/vehicles/${id}`);
      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
      });
      fetchVehicles();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete vehicle",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: "",
      make: "",
      model: "",
      year: "",
      lastServiceDate: "",
      warrantyEndDate: ""
    });
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingVehicle(null);
    resetForm();
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Vehicle Management</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleDialogClose()}>Add Vehicle</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingVehicle 
                      ? "Update vehicle information" 
                      : "Fill in the vehicle details"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="customerId">Customer *</Label>
                    <Select
                      value={formData.customerId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, customerId: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer._id} value={customer._id}>
                            {customer.name} - {customer.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="make">Make</Label>
                      <Input
                        id="make"
                        value={formData.make}
                        onChange={(e) =>
                          setFormData({ ...formData, make: e.target.value })
                        }
                        placeholder="e.g., Toyota"
                      />
                    </div>
                    <div>
                      <Label htmlFor="model">Model *</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) =>
                          setFormData({ ...formData, model: e.target.value })
                        }
                        placeholder="e.g., Camry"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({ ...formData, year: e.target.value })
                      }
                      placeholder="e.g., 2022"
                      min="1900"
                      max="2100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lastServiceDate">Last Service Date</Label>
                      <Input
                        id="lastServiceDate"
                        type="date"
                        value={formData.lastServiceDate}
                        onChange={(e) =>
                          setFormData({ ...formData, lastServiceDate: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="warrantyEndDate">Warranty End Date</Label>
                      <Input
                        id="warrantyEndDate"
                        type="date"
                        value={formData.warrantyEndDate}
                        onChange={(e) =>
                          setFormData({ ...formData, warrantyEndDate: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDialogClose}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingVehicle ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by model..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Make</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Last Service</TableHead>
                    <TableHead>Warranty End</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle._id}>
                      <TableCell>
                        {vehicle.customerId?.name || "Unknown"}
                      </TableCell>
                      <TableCell>{vehicle.make || "-"}</TableCell>
                      <TableCell>{vehicle.model}</TableCell>
                      <TableCell>{vehicle.year || "-"}</TableCell>
                      <TableCell>
                        {vehicle.lastServiceDate
                          ? new Date(vehicle.lastServiceDate).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {vehicle.warrantyEndDate
                          ? new Date(vehicle.warrantyEndDate).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(vehicle)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(vehicle._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-between items-center mt-4">
                <Button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <Button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
