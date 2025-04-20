"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CustomRadio } from "@/components/ui/custom-radio"

export function DebtInfo() {
  const form = useFormContext()
  const [debtItems, setDebtItems] = useState([{ id: 1 }])

  const addDebtItem = () => {
    const newId = debtItems.length > 0 ? Math.max(...debtItems.map((item) => item.id)) + 1 : 1
    setDebtItems([...debtItems, { id: newId }])

    const currentItems = form.getValues("debtItems") || []
    form.setValue("debtItems", [...currentItems, { type: "", amount: "", hasInterest: "否" }])
  }

  const removeDebtItem = (index: number) => {
    if (debtItems.length > 1) {
      const newItems = [...debtItems]
      newItems.splice(index, 1)
      setDebtItems(newItems)

      const currentItems = [...form.getValues("debtItems")]
      currentItems.splice(index, 1)
      form.setValue("debtItems", currentItems)
    }
  }

  const debtTypes = ["银行抵押贷款", "银行信用贷款", "职工债务", "税务债务", "上下游供应商货款", "民间借贷", "其他"]

  const executionOptions = [
    { value: "是", label: "是" },
    { value: "否", label: "否" },
  ]

  const personalDebtOptions = [
    { value: "全部为企业债务", label: "全部为企业债务" },
    { value: "有连带个人债务", label: "有连带个人债务" },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">2. 债务情况</h2>

      <FormField
        control={form.control}
        name="totalDebt"
        render={({ field }) => (
          <FormItem>
            <FormLabel>问题3：请问贵企业名下的债务总额是多少？（单位：元）</FormLabel>
            <FormControl>
              <Input type="number" placeholder="请输入债务总额" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <FormLabel className="block mb-4">
          问题4：请列出贵企业的主要债务情况，包括债务类别、具体金额、是否计息等。
        </FormLabel>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>债务类别</TableHead>
              <TableHead>具体金额（元）</TableHead>
              <TableHead>是否计息</TableHead>
              <TableHead>其他信息</TableHead>
              <TableHead className="w-[80px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debtItems.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`debtItems.${index}.type`}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="选择债务类别" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {debtTypes.map((type) => (
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
                    name={`debtItems.${index}.amount`}
                    render={({ field }) => <Input type="number" placeholder="金额" {...field} />}
                  />
                </TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`debtItems.${index}.hasInterest`}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="是否计息" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="是">是</SelectItem>
                          <SelectItem value="否">否</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </TableCell>
                <TableCell>
                  {form.watch(`debtItems.${index}.type`) === "银行抵押贷款" && (
                    <FormField
                      control={form.control}
                      name={`debtItems.${index}.mortgageAssetType`}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="抵押物类型" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="个人资产">个人资产</SelectItem>
                            <SelectItem value="企业资产">企业资产</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  )}

                  {form.watch(`debtItems.${index}.type`) === "民间借贷" && (
                    <FormField
                      control={form.control}
                      name={`debtItems.${index}.loanSource`}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="借贷来源" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="个人">个人</SelectItem>
                            <SelectItem value="高利贷">高利贷</SelectItem>
                            <SelectItem value="小额贷">小额贷</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDebtItem(index)}
                    disabled={debtItems.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addDebtItem}>
          <Plus className="mr-2 h-4 w-4" /> 添加债务项
        </Button>
      </div>

      <FormField
        control={form.control}
        name="lawsuitDebts"
        render={({ field }) => (
          <FormItem>
            <FormLabel>问题5：目前这些债务中，是否有被起诉的？如有，请列出。</FormLabel>
            <FormControl>
              <Textarea placeholder="请详细描述被起诉的债务情况" className="min-h-[100px]" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="inExecution"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>问题6：是否有债务已进入执行阶段？</FormLabel>
            <FormControl>
              <CustomRadio
                options={executionOptions}
                name="inExecution"
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch("inExecution") === "是" && (
        <FormField
          control={form.control}
          name="executionDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>请说明查封、拍卖情况</FormLabel>
              <FormControl>
                <Textarea placeholder="请详细描述查封、拍卖情况" className="min-h-[100px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="personalDebt"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>问题7：债务是否全部为企业债务？有无连带到您个人？</FormLabel>
            <FormControl>
              <CustomRadio
                options={personalDebtOptions}
                name="personalDebt"
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch("personalDebt") === "有连带个人债务" && (
        <FormField
          control={form.control}
          name="personalDebtAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>连带个人债务金额（元）</FormLabel>
              <FormControl>
                <Input type="number" placeholder="请输入连带个人债务金额" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  )
}
