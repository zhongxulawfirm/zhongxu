"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function AssetInfo() {
  const form = useFormContext()
  const [assetItems, setAssetItems] = useState([{ id: 1 }])

  const addAssetItem = () => {
    const newId = assetItems.length > 0 ? Math.max(...assetItems.map((item) => item.id)) + 1 : 1
    setAssetItems([...assetItems, { id: newId }])

    const currentItems = form.getValues("assetItems") || []
    form.setValue("assetItems", [...currentItems, { type: "", quantity: "", amount: "" }])
  }

  const removeAssetItem = (index: number) => {
    if (assetItems.length > 1) {
      const newItems = [...assetItems]
      newItems.splice(index, 1)
      setAssetItems(newItems)

      const currentItems = [...form.getValues("assetItems")]
      currentItems.splice(index, 1)
      form.setValue("assetItems", currentItems)
    }
  }

  const assetTypes = [
    "土地",
    "房产/厂房",
    "动产（车辆/设备）",
    "应收账款（债权）",
    "无形资产（知识产权/商标/专利）",
    "其他",
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">3. 资产情况</h2>

      <FormField
        control={form.control}
        name="totalAsset"
        render={({ field }) => (
          <FormItem>
            <FormLabel>问题8：请问贵企业名下的资产总额是多少？（单位：元）</FormLabel>
            <FormControl>
              <Input type="number" placeholder="请输入资产总额" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <FormLabel className="block mb-4">问题9：请列出贵企业的主要资产情况，包括资产类别、数量、金额等。</FormLabel>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>资产类别</TableHead>
              <TableHead>数量</TableHead>
              <TableHead>金额（元）</TableHead>
              <TableHead className="w-[80px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assetItems.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`assetItems.${index}.type`}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="选择资产类别" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {assetTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`assetItems.${index}.quantity`}
                    render={({ field }) => <Input placeholder="数量" {...field} />}
                  />
                </TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`assetItems.${index}.amount`}
                    render={({ field }) => <Input type="number" placeholder="金额" {...field} />}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAssetItem(index)}
                    disabled={assetItems.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addAssetItem}>
          <Plus className="mr-2 h-4 w-4" /> 添加资产项
        </Button>
      </div>
    </div>
  )
}
