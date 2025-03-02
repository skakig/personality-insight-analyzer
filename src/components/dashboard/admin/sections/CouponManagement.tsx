
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Edit, Trash2, Copy, CheckCircle, XCircle } from "lucide-react";
import { CouponStats } from "@/components/dashboard/CouponStats";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: 10,
    max_uses: 100,
    expiration_date: "",
    is_active: true,
    description: ""
  });

  // Stats calculations
  const activeCoupons = coupons.filter(c => c.is_active).length;
  const usageRate = coupons.length > 0 
    ? Math.round((coupons.reduce((sum, c) => sum + (c.times_used || 0), 0) / 
        coupons.reduce((sum, c) => sum + (c.max_uses || 100), 0)) * 100) 
    : 0;
  const totalSavings = coupons.reduce((sum, c) => {
    const avgOrderValue = 14.99;
    const discount = c.discount_type === 'percentage' 
      ? avgOrderValue * (c.discount_value / 100) 
      : c.discount_value;
    return sum + (discount * (c.times_used || 0));
  }, 0);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast({
        title: "Error",
        description: "Failed to load coupons. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async () => {
    try {
      if (!newCoupon.code) {
        toast({
          title: "Error",
          description: "Coupon code is required",
          variant: "destructive",
        });
        return;
      }

      // Map our form data to the structure expected by the database
      const couponData = {
        code: newCoupon.code,
        discount_type: newCoupon.discount_type,
        discount_amount: newCoupon.discount_value, // Rename this to match database column
        max_uses: newCoupon.max_uses,
        expires_at: newCoupon.expiration_date || null, // Use null if no date provided
        is_active: newCoupon.is_active,
        // Additional field for the description that might be stored in metadata or another field
        // You might need to adjust this based on your database schema
        description: newCoupon.description,
        current_uses: 0 // Initialize with 0 uses
      };

      const { data, error } = await supabase
        .from('coupons')
        .insert([couponData])
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Coupon created successfully",
      });
      
      setCoupons([...(data || []), ...coupons]);
      setNewCoupon({
        code: "",
        discount_type: "percentage",
        discount_value: 10,
        max_uses: 100,
        expiration_date: "",
        is_active: true,
        description: ""
      });
      setActiveTab("all");
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast({
        title: "Error",
        description: "Failed to create coupon. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleCouponStatus = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      setCoupons(coupons.map(coupon => 
        coupon.id === id ? {...coupon, is_active: !currentStatus} : coupon
      ));
      
      toast({
        title: "Success",
        description: `Coupon ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error toggling coupon status:', error);
      toast({
        title: "Error",
        description: "Failed to update coupon status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setCoupons(coupons.filter(coupon => coupon.id !== id));
      
      toast({
        title: "Success",
        description: "Coupon deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast({
        title: "Error",
        description: "Failed to delete coupon. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied",
      description: `Coupon code "${code}" copied to clipboard`,
    });
  };

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (coupon.description && coupon.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "active") return matchesSearch && coupon.is_active;
    if (activeTab === "inactive") return matchesSearch && !coupon.is_active;
    return matchesSearch;
  });

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCoupon({...newCoupon, code: result});
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Coupon Management</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CouponStats
          statTitle="Total Coupons"
          statValue={coupons.length.toString()}
          statDescription="Active and inactive coupons"
          trend="neutral"
        />
        <CouponStats
          statTitle="Active Coupons"
          statValue={activeCoupons.toString()}
          statDescription="Currently active coupons"
          trend="up"
        />
        <CouponStats
          statTitle="Usage Rate"
          statValue={`${usageRate}%`}
          statDescription="Average coupon usage"
          trend="neutral"
        />
        <CouponStats
          statTitle="Total Savings"
          statValue={`$${totalSavings.toFixed(2)}`}
          statDescription="Amount saved by customers"
          trend="up"
        />
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">All Coupons</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search coupons..."
              className="pl-8 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <TabsContent value="all" className="mt-0">
          <CouponTable 
            coupons={filteredCoupons} 
            onToggleStatus={handleToggleCouponStatus}
            onDelete={handleDeleteCoupon}
            onCopy={handleCopyCoupon}
            loading={loading}
          />
        </TabsContent>
        
        <TabsContent value="active" className="mt-0">
          <CouponTable 
            coupons={filteredCoupons} 
            onToggleStatus={handleToggleCouponStatus}
            onDelete={handleDeleteCoupon}
            onCopy={handleCopyCoupon}
            loading={loading}
          />
        </TabsContent>
        
        <TabsContent value="inactive" className="mt-0">
          <CouponTable 
            coupons={filteredCoupons} 
            onToggleStatus={handleToggleCouponStatus}
            onDelete={handleDeleteCoupon}
            onCopy={handleCopyCoupon}
            loading={loading}
          />
        </TabsContent>
        
        <TabsContent value="create" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Create New Coupon</CardTitle>
              <CardDescription>
                Create a new discount coupon for your customers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Coupon Code</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="code" 
                      value={newCoupon.code} 
                      onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                      placeholder="e.g. SUMMER20"
                      className="uppercase"
                    />
                    <Button 
                      variant="outline" 
                      onClick={generateRandomCode}
                      type="button"
                    >
                      Generate
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="discount_type">Discount Type</Label>
                  <Select 
                    value={newCoupon.discount_type} 
                    onValueChange={(value) => setNewCoupon({...newCoupon, discount_type: value})}
                  >
                    <SelectTrigger id="discount_type">
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="discount_value">
                    {newCoupon.discount_type === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
                  </Label>
                  <div className="relative">
                    <Input 
                      id="discount_value" 
                      type="number"
                      value={newCoupon.discount_value} 
                      onChange={(e) => setNewCoupon({...newCoupon, discount_value: parseFloat(e.target.value)})}
                      min={0}
                      max={newCoupon.discount_type === 'percentage' ? 100 : 999}
                      className={newCoupon.discount_type === 'percentage' ? 'pr-8' : 'pl-6'}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      {newCoupon.discount_type === 'percentage' ? '%' : ''}
                    </div>
                    {newCoupon.discount_type === 'fixed' && (
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        $
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max_uses">Maximum Uses</Label>
                  <Input 
                    id="max_uses" 
                    type="number"
                    value={newCoupon.max_uses} 
                    onChange={(e) => setNewCoupon({...newCoupon, max_uses: parseInt(e.target.value)})}
                    min={1}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expiration_date">Expiration Date (Optional)</Label>
                  <Input 
                    id="expiration_date" 
                    type="date"
                    value={newCoupon.expiration_date} 
                    onChange={(e) => setNewCoupon({...newCoupon, expiration_date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="is_active">Status</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch 
                      id="is_active" 
                      checked={newCoupon.is_active}
                      onCheckedChange={(checked) => setNewCoupon({...newCoupon, is_active: checked})}
                    />
                    <Label htmlFor="is_active" className="cursor-pointer">
                      {newCoupon.is_active ? 'Active' : 'Inactive'}
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input 
                  id="description" 
                  value={newCoupon.description} 
                  onChange={(e) => setNewCoupon({...newCoupon, description: e.target.value})}
                  placeholder="e.g. Summer sale promotion"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("all")}>Cancel</Button>
              <Button onClick={handleCreateCoupon}>
                <Plus className="mr-2 h-4 w-4" />
                Create Coupon
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CouponTable({ coupons, onToggleStatus, onDelete, onCopy, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (coupons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-gray-400 mb-2">
          <Search className="h-12 w-12 mx-auto mb-2" />
          <h3 className="text-lg font-medium">No coupons found</h3>
          <p className="text-sm">Try adjusting your search or create a new coupon.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expiration</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((coupon) => (
            <TableRow key={coupon.id}>
              <TableCell className="font-medium">
                <div className="flex items-center space-x-2">
                  <span className="font-mono">{coupon.code}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onCopy(coupon.code)}
                    className="h-6 w-6"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {coupon.description && (
                  <span className="text-xs text-gray-500 block mt-1">{coupon.description}</span>
                )}
              </TableCell>
              <TableCell>
                {coupon.discount_type === 'percentage' 
                  ? `${coupon.discount_value || coupon.discount_amount}%` 
                  : `$${(coupon.discount_value || coupon.discount_amount).toFixed(2)}`
                }
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {coupon.times_used || coupon.current_uses || 0} / {coupon.max_uses || '∞'}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={coupon.is_active ? "default" : "secondary"}>
                  {coupon.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                {coupon.expiration_date || coupon.expires_at
                  ? new Date(coupon.expiration_date || coupon.expires_at).toLocaleDateString() 
                  : 'No expiration'
                }
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onToggleStatus(coupon.id, coupon.is_active)}
                  >
                    {coupon.is_active 
                      ? <XCircle className="h-4 w-4 text-red-500" /> 
                      : <CheckCircle className="h-4 w-4 text-green-500" />
                    }
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onDelete(coupon.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
