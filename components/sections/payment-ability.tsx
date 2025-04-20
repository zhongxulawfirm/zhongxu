"use client"

import { useFormContext } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { CustomRadio } from "@/components/ui/custom-radio"

export function PaymentAbility() {
  const form = useFormContext()

  const operatingOptions = [
    { value: "是", label: "是" },
    { value: "否", label: "否" },
  ]

  const otherBusinessOptions = [
    { value: "是", label: "是" },
    { value: "否", label: "否" },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">7. 支付能力</h2>

      <FormField
        control={form.control}
        name="stillOperating"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>问题15：目前企业是否还在经营？</FormLabel>
            <FormControl>
              <CustomRadio
                options={operatingOptions}
                name="stillOperating"
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch("stillOperating") === "是" && (
        <FormField
          control={form.control}
          name="employeeCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>问题16：请说明目前在经营的企业还有多少员工。</FormLabel>
              <FormControl>
                <Input type="number" placeholder="请输入员工数量" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {form.watch("stillOperating") === "否" && (
        <FormField
          control={form.control}
          name="stopOperatingTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>问题17：请说明企业停止经营多久了。</FormLabel>
              <FormControl>
                <Input placeholder="例如：6个月、2年等" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="otherBusiness"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>问题18：贵企业是否还有其他业务在经营？</FormLabel>
            <FormControl>
              <CustomRadio
                options={otherBusinessOptions}
                name="otherBusiness"
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
