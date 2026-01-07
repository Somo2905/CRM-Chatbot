import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
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
import { useToast } from "../components/ui/use-toast";
import { nodeBackendService } from "../services/nodeBackendService";

export default function ServiceSlotManagement() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    capacity: 5
  });
  const [bulkFormData, setBulkFormData] = useState({
    startDate: "",
    endDate: "",
    times: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
    capacity: 5
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSlots();
  }, [page]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await nodeBackendService.get(
        `/service-slots?page=${page}&limit=20`
      );
      setSlots(response.slots);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch service slots",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSlot) {
        await nodeBackendService.put(`/service-slots/${editingSlot._id}`, formData);
        toast({
          title: "Success",
          description: "Service slot updated successfully",
        });
      } else {
        await nodeBackendService.post("/service-slots", formData);
        toast({
          title: "Success",
          description: "Service slot created successfully",
        });
      }
      setDialogOpen(false);
      setEditingSlot(null);
      setFormData({ date: "", time: "", capacity: 5 });
      fetchSlots();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save service slot",
        variant: "destructive",
      });
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    try {
      await nodeBackendService.post("/service-slots/bulk", bulkFormData);
      toast({
        title: "Success",
        description: "Bulk service slots created successfully",
      });
      setBulkDialogOpen(false);
      setBulkFormData({
        startDate: "",
        endDate: "",
        times: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
        capacity: 5
      });
      fetchSlots();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create bulk slots",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      date: new Date(slot.date).toISOString().split("T")[0],
      time: slot.time,
      capacity: slot.capacity
    });
    setDialogOpen(true);
  };

  const handleToggleActive = async (slot) => {
    try {
      await nodeBackendService.put(`/service-slots/${slot._id}`, {
        isActive: !slot.isActive
      });
      toast({
        title: "Success",
        description: `Service slot ${slot.isActive ? "deactivated" : "activated"}`,
      });
      fetchSlots();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update service slot",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this service slot?")) return;
    
    try {
      await nodeBackendService.delete(`/service-slots/${id}`);
      toast({
        title: "Success",
        description: "Service slot deleted successfully",
      });
      fetchSlots();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete service slot",
        variant: "destructive",
      });
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingSlot(null);
    setFormData({ date: "", time: "", capacity: 5 });
  };

  const addBulkTime = () => {
    const newTime = prompt("Enter time (HH:MM format):");
    if (newTime && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(newTime)) {
      setBulkFormData({
        ...bulkFormData,
        times: [...bulkFormData.times, newTime]
      });
    } else if (newTime) {
      toast({
        title: "Error",
        description: "Invalid time format. Use HH:MM",
        variant: "destructive",
      });
    }
  };

  const removeBulkTime = (time) => {
    setBulkFormData({
      ...bulkFormData,
      times: bulkFormData.times.filter(t => t !== time)
    });
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Service Slot Management</CardTitle>
            <div className="flex gap-2">
              <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Bulk Create</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bulk Create Service Slots</DialogTitle>
                    <DialogDescription>
                      Create multiple slots across a date range
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleBulkSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Start Date *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={bulkFormData.startDate}
                          onChange={(e) =>
                            setBulkFormData({ ...bulkFormData, startDate: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">End Date *</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={bulkFormData.endDate}
                          onChange={(e) =>
                            setBulkFormData({ ...bulkFormData, endDate: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Time Slots</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {bulkFormData.times.map((time) => (
                          <div key={time} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded">
                            <span>{time}</span>
                            <button
                              type="button"
                              onClick={() => removeBulkTime(time)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addBulkTime}
                        >
                          + Add Time
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bulkCapacity">Capacity per Slot *</Label>
                      <Input
                        id="bulkCapacity"
                        type="number"
                        min="1"
                        value={bulkFormData.capacity}
                        onChange={(e) =>
                          setBulkFormData({ ...bulkFormData, capacity: Number(e.target.value) })
                        }
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setBulkDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Create Slots</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleDialogClose()}>Add Slot</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingSlot ? "Edit Service Slot" : "Add New Service Slot"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        required
                        disabled={!!editingSlot}
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Time *</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) =>
                          setFormData({ ...formData, time: e.target.value })
                        }
                        required
                        disabled={!!editingSlot}
                      />
                    </div>
                    <div>
                      <Label htmlFor="capacity">Capacity *</Label>
                      <Input
                        id="capacity"
                        type="number"
                        min="1"
                        value={formData.capacity}
                        onChange={(e) =>
                          setFormData({ ...formData, capacity: Number(e.target.value) })
                        }
                        required
                      />
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
                        {editingSlot ? "Update" : "Create"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Booked</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.map((slot) => (
                    <TableRow key={slot._id}>
                      <TableCell>
                        {new Date(slot.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{slot.time}</TableCell>
                      <TableCell>{slot.capacity}</TableCell>
                      <TableCell>{slot.bookedCount}</TableCell>
                      <TableCell>{slot.capacity - slot.bookedCount}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            slot.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {slot.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(slot)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant={slot.isActive ? "secondary" : "default"}
                            onClick={() => handleToggleActive(slot)}
                          >
                            {slot.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(slot._id)}
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
