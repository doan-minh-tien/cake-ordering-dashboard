"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";

import { useDataTable } from "@/hooks/use-data-table";
import { Card, CardContent } from "@/components/ui/card";
import { generateColumnLabels } from "@/components/data-table/column-label-mapping";
import { ICakeDecorationType } from "../../types/cake-decoration-type";
import { ApiListResponse } from "@/lib/api/api-handler/generic";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  Package,
  TagIcon,
  Edit2Icon,
  PaletteIcon,
  TrashIcon,
  PlusCircle,
  Settings,
  Cake,
} from "lucide-react";
import { ExpandDataTable } from "@/components/data-table/expand-data-table";
import { Badge } from "@/components/ui/badge";
import { useModal } from "@/hooks/use-modal";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AlertModal from "@/components/modals/alert-modal";
import { deleteCakeDecoration } from "../../actions/cake-decoration-action";
import { toast } from "sonner";
// Utility function to format VND
const formatVND = (price: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);

// Simplified icon mapping
const getItemIcon = (type: string) => {
  const iconMap = {
    Topping: Package,
    Color: PaletteIcon,
    default: Package,
  };

  return iconMap[type as keyof typeof iconMap] || iconMap["default"];
};

// Tên hiển thị tiếng Việt cho các loại trang trí
const getTypeDisplayName = (type: string): string => {
  const typeNameMap: Record<string, string> = {
    OUTERICING: "Phủ ngoài",
    SPRINKLES: "Rắc phủ",
    DECORATION: "Trang trí",
    BLING: "Trang trí kim tuyến",
    TALLSKIRT: "Viền cao",
    DRIP: "Trang trí chảy",
    SHORTSKIRT: "Viền thấp",
    CANDLES: "Nến",
    CAKEBOARD: "Đế bánh",
  };

  return typeNameMap[type.toUpperCase()] || type;
};

// Predefined types for cake decorations
const PREDEFINED_TYPES: Record<string, string> = {
  OUTERICING: "Phủ ngoài",
  SPRINKLES: "Rắc phủ",
  DECORATION: "Trang trí",
  BLING: "Trang trí kim tuyến",
  TALLSKIRT: "Viền cao",
  DRIP: "Trang trí chảy",
  SHORTSKIRT: "Viền thấp",
  CANDLES: "Nến",
  CAKEBOARD: "Đế bánh",
};

interface CakeDecorationTableProps {
  data: ApiListResponse<ICakeDecorationType>;
}

export function CakeDecorationTable({ data }: CakeDecorationTableProps) {
  const [expandedRows, setExpandedRows] = React.useState<
    Record<string, boolean>
  >({});
  const { onOpen } = useModal();
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const [openDeleteId, setOpenDeleteId] = React.useState<string | null>(null);

  const { data: cakeData, pageCount } = data;

  // Get existing types from data
  const existingTypes = React.useMemo(() => {
    return cakeData.map((item) => item.type);
  }, [cakeData]);

  // Check if all predefined types already exist
  const allPredefinedTypesExist = React.useMemo(() => {
    return Object.keys(PREDEFINED_TYPES).every((type) =>
      existingTypes.includes(type)
    );
  }, [existingTypes]);

  const handleDelete = async (id?: string) => {
    startTransition(async () => {
      const result = await deleteCakeDecoration(id!);
      if (result.success) {
        setOpenDeleteModal(false);
        toast.success("Đã xóa thành công");
      } else {
        toast.error("Đã xảy ra lỗi");
      }
    });
  };

  const toggleRowExpansion = (type: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const columns = React.useMemo<ColumnDef<ICakeDecorationType, unknown>[]>(
    () => [
      {
        accessorKey: "type",
        header: "Loại Trang Trí",
        cell: ({ row }) => (
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant="outline"
              size="icon"
              className="rounded-full hover:bg-indigo-50 transition-all"
              onClick={() => toggleRowExpansion(row.original.type)}
            >
              <AnimatePresence mode="wait">
                {expandedRows[row.original.type] ? (
                  <ChevronDown className="text-indigo-600" />
                ) : (
                  <ChevronRight className="text-indigo-600" />
                )}
              </AnimatePresence>
            </Button>
            <Badge
              variant="secondary"
              className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700"
            >
              {getTypeDisplayName(row.original.type)}
            </Badge>
          </motion.div>
        ),
      },
      {
        accessorKey: "items",
        header: "Số Lượng Danh Mục",
        cell: ({ row }) => (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-600">
              <TagIcon className="h-4 w-4 text-indigo-500" />
              <span className="font-medium">
                {row.original.items.length} danh mục
              </span>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-3 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700 hover:text-indigo-800 transition-all"
                  onClick={() =>
                    onOpen("collectionCakeDecorationModal", {
                      ingredientType: row.original.type,
                    })
                  }
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Thêm danh mục
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Thêm danh mục mới</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ),
      },
    ],
    [expandedRows, onOpen]
  );

  const labels = generateColumnLabels(columns);

  const { dataTable } = useDataTable({
    data: cakeData,
    columns,
    pageCount,
    searchableColumns: [],
    filterableColumns: [],
  });

  const renderExpandedContent = (type: string, items: any[]) => {
    if (!expandedRows[type]) return null;

    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="p-0">
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <Card className="m-2 rounded-lg overflow-hidden shadow-md border-amber-200">
              <div className="p-3 bg-gradient-to-r from-amber-100 to-amber-50 border-b border-amber-200 flex justify-between items-center">
                <h3 className="text-amber-800 font-medium flex items-center">
                  {React.createElement(getItemIcon(type), {
                    className: "h-5 w-5 mr-2 text-amber-600",
                  })}
                  Danh sách {getTypeDisplayName(type).toLowerCase()}
                </h3>
              </div>
              <Table>
                <TableHeader className="bg-amber-50/70">
                  <TableRow>
                    {[
                      "Tên",
                      "Giá",
                      "Màu Sắc",
                      "Mô Tả",
                      "Mặc Định",
                      "Thao Tác",
                    ].map((header) => (
                      <TableHead
                        key={header}
                        className="text-amber-700 font-medium"
                      >
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {items.map((item, index) => {
                      const ItemIcon = getItemIcon(type);
                      return (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: index * 0.05,
                            duration: 0.3,
                          }}
                          className="hover:bg-amber-50/60 transition-colors border-b border-amber-100"
                        >
                          <TableCell className="flex items-center space-x-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 shadow-sm">
                              <ItemIcon className="h-4 w-4 text-amber-600" />
                            </div>
                            <span className="font-medium text-gray-800">
                              {item.name}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 shadow-sm"
                            >
                              {formatVND(item.price)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div
                                className="w-5 h-5 rounded-full inline-block mr-2 shadow-sm border border-gray-200"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-gray-700">
                                {item.color}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600 max-w-xs truncate">
                            {item.description || "Không có mô tả"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={item.is_default ? "default" : "outline"}
                              className={cn(
                                "text-center",
                                item.is_default
                                  ? "bg-amber-500 text-white"
                                  : "text-gray-500 border-gray-300"
                              )}
                            >
                              {item.is_default ? "Có" : "Không"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="hover:bg-amber-50 group border-amber-200"
                                    onClick={() =>
                                      onOpen("cakeDecorationModal", {
                                        cakeDecoration: item,
                                      })
                                    }
                                  >
                                    <Edit2Icon className="h-4 w-4 text-amber-600 group-hover:rotate-12 transition-transform" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Chỉnh sửa</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="hover:bg-red-50 group border-red-200"
                                    onClick={() => {
                                      setOpenDeleteId(item.id);
                                      setOpenDeleteModal(true);
                                    }}
                                  >
                                    <TrashIcon className="h-4 w-4 text-red-500 group-hover:scale-90 transition-transform" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Xóa</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
              {items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-amber-50/30">
                  <Package className="h-12 w-12 text-amber-200 mb-4" />
                  <h3 className="text-amber-700 font-medium mb-1">
                    Chưa có danh mục nào
                  </h3>
                  <p className="text-amber-600 mb-4">
                    Hãy thêm danh mục đầu tiên cho loại trang trí này
                  </p>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                    onClick={() =>
                      onOpen("collectionCakeDecorationModal", {
                        ingredientType: type,
                      })
                    }
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Thêm danh mục
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <>
      <AlertModal
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={() => handleDelete(openDeleteId!)}
        title="Xóa"
        description="Bạn có chắc chắn với hành động này không?"
      />
      <div className="space-y-4">
        <Card className="shadow-md border-amber-200 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100/50 border-b border-amber-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-amber-800 flex items-center">
              <Cake className="h-5 w-5 mr-2 text-amber-600" />
              Quản lý trang trí bánh
            </h2>
            {!allPredefinedTypesExist && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full px-3 bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 hover:text-amber-800 transition-all flex items-center gap-1"
                onClick={() =>
                  onOpen("createIngredientTypeModal", { existingTypes })
                }
              >
                <PlusCircle className="h-4 w-4" />
                <span>Thêm loại trang trí mới</span>
              </Button>
            )}
          </div>
          <CardContent>
            {cakeData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <Package className="h-12 w-12 text-amber-200 mb-4" />
                <h3 className="text-amber-700 font-medium mb-1">
                  Chưa có loại trang trí nào
                </h3>
                <p className="text-amber-600 mb-4">
                  Bạn cần tạo loại trang trí trước khi thêm các danh mục
                </p>
                {!allPredefinedTypesExist && (
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                    onClick={() =>
                      onOpen("createIngredientTypeModal", { existingTypes })
                    }
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Tạo loại trang trí
                  </Button>
                )}
              </div>
            ) : (
              <ExpandDataTable
                dataTable={dataTable}
                columns={columns}
                searchableColumns={[]}
                filterableColumns={[]}
                columnLabels={labels}
                renderAdditionalRows={(row) =>
                  renderExpandedContent(row.original.type, row.original.items)
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default CakeDecorationTable;
