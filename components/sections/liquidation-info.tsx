"use client"

import { useFormContext } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { CustomRadio } from "@/components/ui/custom-radio"

export function LiquidationInfo() {
  const form = useFormContext()

  const capitalPaidOptions = [
    { value: "已完成实缴", label: "已完成实缴" },
    { value: "未完成实缴", label: "未完成实缴" },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">5. 清算与实缴情况</h2>

      <FormField
        control={form.control}
        name="capitalPaid"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>问题12：请问贵公司的注册资本是否已完成实缴？（重整无需实缴完成）</FormLabel>
            <FormControl>
              <CustomRadio
                options={capitalPaidOptions}
                name="capitalPaid"
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch("capitalPaid") === "已完成实缴" && (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="registeredCapital"
            render={({ field }) => (
              <FormItem>
                <FormLabel>注册资本（元）</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="请输入注册资本" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paidCapital"
            render={({ field }) => (
              <FormItem>
                <FormLabel>实缴金额（元）</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="请输入实缴金额" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registrationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>注册时间</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  )
}
