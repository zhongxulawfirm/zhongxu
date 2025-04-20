"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Plus, Trash2, AlertTriangle } from "lucide-react"
import { SuccessView } from "./success-view"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// 定义表单验证模式
const formSchema = z.object({
  // 基本信息
  role: z.string().min(1, { message: "请选择您的角色" }),
  contact: z.string().min(1, { message: "请提供联系方式" }),
  region: z.string().min(1, { message: "请选择所在地区" }),
  companyName: z.string().min(1, { message: "请提供公司名称" }),

  // 债务情况
  totalDebt: z.string().min(1, { message: "请填写债务总额" }),
  debtItems: z
    .array(
      z.object({
        type: z.string().min(1, { message: "请选择债务类别" }),
        amount: z.string().min(1, { message: "请输入金额" }),
        hasInterest: z.string().min(1, { message: "请选择是否计息" }),
        interestType: z.string().optional(),
        mortgageAssetType: z.string().optional(),
        loanSource: z.string().optional(),
      }),
    )
    .min(1, { message: "请至少添加一项债务" }),
  lawsuitDebts: z.string().optional(),
  inExecution: z.string().min(1, { message: "请选择是否有债务已进入执行阶段" }),
  executionDetails: z.string().optional(),
  personalDebt: z.string().min(1, { message: "请选择债务是否全部为企业债务" }),
  personalDebtAmount: z.string().optional(),

  // 资产情况
  totalAsset: z.string().min(1, { message: "请填写资产总额" }),
  assetItems: z
    .array(
      z.object({
        type: z.string().min(1, { message: "请选择资产类别" }),
        quantity: z.string().min(1, { message: "请输入数量" }),
        amount: z.string().min(1, { message: "请输入金额" }),
      }),
    )
    .min(1, { message: "请至少添加一项资产" }),

  // 客户诉求
  continueBusiness: z.string().min(1, { message: "请选择是否继续经营企业" }),
  problemsToSolve: z.string().optional(),

  // 清算与实缴情况
  capitalPaid: z.string().min(1, { message: "请选择是否已完成实缴" }),
  registeredCapital: z.string().optional(),
  paidCapital: z.string().optional(),
  registrationDate: z.string().optional(),

  // 支付能力
  stillOperating: z.string().min(1, { message: "请选择企业是否还在经营" }),
  employeeCount: z.string().optional(),
  stopOperatingTime: z.string().optional(),
  otherBusiness: z.string().min(1, { message: "请选择是否有其他业务在经营" }),
  otherBusinessContent: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function SimpleForm() {
  const [currentSection, setCurrentSection] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedData, setSubmittedData] = useState<FormValues | null>(null)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [forceSubmit, setForceSubmit] = useState(false)
  const [currentDate, setCurrentDate] = useState("")

  // 添加数字输入验证错误状态
  const [numberInputErrors, setNumberInputErrors] = useState<Record<string, string>>({})

  // 设置当前日期，用于限制日期选择器
  useEffect(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    setCurrentDate(`${year}-${month}-${day}`)
  }, [])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "",
      contact: "",
      region: "",
      companyName: "",
      totalDebt: "",
      debtItems: [{ type: "", amount: "", hasInterest: "否", interestType: "" }],
      lawsuitDebts: "",
      inExecution: "",
      executionDetails: "",
      personalDebt: "",
      personalDebtAmount: "",
      totalAsset: "",
      assetItems: [{ type: "", quantity: "", amount: "" }],
      continueBusiness: "",
      problemsToSolve: "",
      capitalPaid: "",
      registeredCapital: "",
      paidCapital: "",
      registrationDate: "",
      stillOperating: "",
      employeeCount: "",
      stopOperatingTime: "",
      otherBusiness: "",
      otherBusinessContent: "",
    },
    mode: "onBlur",
  })

  const {
    fields: debtFields,
    append: appendDebt,
    remove: removeDebt,
  } = useFieldArray({
    control,
    name: "debtItems",
  })

  const {
    fields: assetFields,
    append: appendAsset,
    remove: removeAsset,
  } = useFieldArray({
    control,
    name: "assetItems",
  })

  // 验证数字输入
  const validateNumberInput = (value: string, fieldName: string) => {
    // 允许空值（让表单验证处理必填项）
    if (!value) {
      setNumberInputErrors((prev) => ({ ...prev, [fieldName]: "" }))
      return true
    }

    // 检查是否为有效数字
    if (!/^-?\d*\.?\d*$/.test(value)) {
      setNumberInputErrors((prev) => ({ ...prev, [fieldName]: "请输入有效的数字" }))
      return false
    }

    setNumberInputErrors((prev) => ({ ...prev, [fieldName]: "" }))
    return true
  }

  // 处理数字输入变化
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const value = e.target.value
    if (validateNumberInput(value, fieldName)) {
      setValue(fieldName as any, value)
    }
  }

  // 收集表单错误信息
  const collectFormErrors = () => {
    const errorMessages: string[] = []

    // 检查基本信息
    if (errors.role) errorMessages.push("问题1：请选择您的角色")
    if (errors.contact) errorMessages.push("问题2：请提供联系方式")
    if (errors.region) errorMessages.push("问题3：请选择所在地区")
    if (errors.companyName) errorMessages.push("问题4：请提供公司名称")

    // 检查债务情况
    if (errors.totalDebt) errorMessages.push("问题5：请填写债务总额")
    if (errors.debtItems) {
      if (typeof errors.debtItems === "object" && !Array.isArray(errors.debtItems)) {
        errorMessages.push("问题6：请至少添加一项债务")
      } else {
        // 检查数组中的每一项
        errors.debtItems.forEach((item, index) => {
          if (item?.type) errorMessages.push(`问题6：第${index + 1}项债务类别未选择`)
          if (item?.amount) errorMessages.push(`问题6：第${index + 1}项债务金额未填写`)
        })
      }
    }
    if (errors.inExecution) errorMessages.push("问题8：请选择是否有债务已进入执行阶段")
    if (errors.personalDebt) errorMessages.push("问题9：请选择债务是否全部为企业债务")

    // 检查资产情况
    if (errors.totalAsset) errorMessages.push("问题10：请填写资产总额")
    if (errors.assetItems) {
      if (typeof errors.assetItems === "object" && !Array.isArray(errors.assetItems)) {
        errorMessages.push("问题11：请至少添加一项资产")
      } else {
        // 检查数组中的每一项
        errors.assetItems.forEach((item, index) => {
          if (item?.type) errorMessages.push(`问题11：第${index + 1}项资产类别未选择`)
          if (item?.quantity) errorMessages.push(`问题11：第${index + 1}项资产数量未填写`)
          if (item?.amount) errorMessages.push(`问题11：第${index + 1}项资产金额未填写`)
        })
      }
    }

    // 检查客户诉求
    if (errors.continueBusiness) errorMessages.push("问题12：请选择是否继续经营企业")

    // 检查清算与实缴情况
    if (errors.capitalPaid) errorMessages.push("问题14：请选择是否已完成实缴")

    // 检查支付能力
    if (errors.stillOperating) errorMessages.push("问题15：请选择企业是否还在经营")
    if (errors.otherBusiness) errorMessages.push("问题18：请选择是否有其他业务在经营")

    // 检查数字输入错误
    Object.entries(numberInputErrors).forEach(([field, error]) => {
      if (error) {
        let fieldName = "未知字段"
        if (field === "totalDebt") fieldName = "债务总额"
        else if (field === "totalAsset") fieldName = "资产总额"
        else if (field === "personalDebtAmount") fieldName = "连带个人债务金额"
        else if (field === "registeredCapital") fieldName = "注册资本"
        else if (field === "paidCapital") fieldName = "实缴金额"
        else if (field === "employeeCount") fieldName = "员工数量"
        else if (field.includes("debtItems")) fieldName = "债务项金额"
        else if (field.includes("assetItems")) fieldName = "资产项金额"

        errorMessages.push(`${fieldName}：${error}`)
      }
    })

    return errorMessages
  }

  // 找到第一个错误所在的部分
  const findFirstErrorSection = () => {
    // 基本信息
    if (errors.role || errors.contact || errors.region || errors.companyName) {
      return 0
    }

    // 债务情况
    if (
      errors.totalDebt ||
      errors.debtItems ||
      errors.inExecution ||
      errors.personalDebt ||
      numberInputErrors.totalDebt ||
      numberInputErrors.personalDebtAmount ||
      Object.keys(numberInputErrors).some((key) => key.includes("debtItems"))
    ) {
      return 1
    }

    // 资产情况
    if (
      errors.totalAsset ||
      errors.assetItems ||
      numberInputErrors.totalAsset ||
      Object.keys(numberInputErrors).some((key) => key.includes("assetItems"))
    ) {
      return 2
    }

    // 客户诉求
    if (errors.continueBusiness) {
      return 3
    }

    // 清算与实缴情况
    if (errors.capitalPaid || numberInputErrors.registeredCapital || numberInputErrors.paidCapital) {
      return 4
    }

    // 支付能力
    if (errors.stillOperating || errors.otherBusiness || numberInputErrors.employeeCount) {
      return 5
    }

    return 0
  }

  // 处理表单提交
  const onSubmit = (data: FormValues) => {
    console.log(data)
    setSubmittedData(data)
    setIsSubmitted(true)
  }

  // 处理表单提交前的验证
  const handleFormSubmit = async () => {
    // 触发所有字段的验证
    const isFormValid = await trigger()

    // 检查数字输入错误
    const hasNumberErrors = Object.values(numberInputErrors).some((error) => error !== "")

    if (!isFormValid || hasNumberErrors) {
      // 收集错误信息
      const errors = collectFormErrors()
      setFormErrors(errors)
      setIsAlertOpen(true)
    } else {
      // 如果表单有效，直接提交
      handleSubmit(onSubmit)()
    }
  }

  // 当强制提交状态改变时提交表单
  useEffect(() => {
    if (forceSubmit) {
      handleSubmit(onSubmit)()
      setForceSubmit(false)
    }
  }, [forceSubmit, handleSubmit])

  function handleEdit() {
    setIsSubmitted(false)
    // 返回到第一部分
    setCurrentSection(0)
    window.scrollTo(0, 0)
  }

  function nextSection() {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1)
      window.scrollTo(0, 0)
    }
  }

  function prevSection() {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
      window.scrollTo(0, 0)
    }
  }

  // 处理返回修改
  const handleReturnToEdit = () => {
    setIsAlertOpen(false)
    const errorSection = findFirstErrorSection()
    setCurrentSection(errorSection)
    window.scrollTo(0, 0)
  }

  // 处理忽略错误并提交
  const handleIgnoreAndSubmit = () => {
    setIsAlertOpen(false)

    // 标记表单已忽略错误
    const formDataWithIgnoredErrors = { ...watch(), _ignoredErrors: true }

    // 直接提交表单
    setSubmittedData(formDataWithIgnoredErrors)
    setIsSubmitted(true)
  }

  const debtTypes = ["银行抵押贷款", "银行信用贷款", "职工债务", "税务债务", "上下游供应商货款", "民间借贷", "其他"]
  const assetTypes = [
    "土地",
    "房产/厂房",
    "动产（车辆/设备）",
    "应收账款（债权）",
    "无形资产（知识产权/商标/专利）",
    "其他",
  ]

  const sections = [
    {
      title: "基本信息",
      fields: (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">1. 基本信息</h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium">问题1：请问您是公司的法人、股东还是实际控制人？</label>
            <div className="space-y-2">
              {["法人", "股东", "实际控制人"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <input type="radio" id={`role-${option}`} value={option} {...register("role")} className="h-4 w-4" />
                  <label htmlFor={`role-${option}`} className="text-sm">
                    {option}
                  </label>
                </div>
              ))}
            </div>
            {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">问题2：请提供您的联系方式（手机/邮箱）</label>
            <Input placeholder="请输入您的联系方式" {...register("contact")} />
            {errors.contact && <p className="text-red-500 text-sm">{errors.contact.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">问题3：所在地区</label>
            <select
              {...register("region")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 appearance-none"
              size={1}
              style={{ WebkitAppearance: "menulist-button" }}
            >
              <option value="">请选择所在地区</option>
              {[
                "北京市",
                "天津市",
                "上海市",
                "重庆市",
                "河北省",
                "山西省",
                "辽宁省",
                "吉林省",
                "黑龙江省",
                "江苏省",
                "浙江省",
                "安徽省",
                "福建省",
                "江西省",
                "山东省",
                "河南省",
                "湖北省",
                "湖南省",
                "广东省",
                "海南省",
                "四川省",
                "贵州省",
                "云南省",
                "陕西省",
                "甘肃省",
                "青海省",
                "台湾省",
                "内蒙古自治区",
                "广西壮族自治区",
                "西藏自治区",
                "宁夏回族自治区",
                "新疆维吾尔自治区",
                "香港特别行政区",
                "澳门特别行政区",
              ].map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            {errors.region && <p className="text-red-500 text-sm">{errors.region.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">问题4：请提供您的公司名称</label>
            <Input placeholder="请输入公司名称" {...register("companyName")} />
            {errors.companyName && <p className="text-red-500 text-sm">{errors.companyName.message}</p>}
          </div>
        </div>
      ),
    },
    {
      title: "债务情况",
      fields: (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">2. 债务情况</h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium">问题5：请问贵企业名下的债务总额是多少？（单位：万元）</label>
            <Input
              type="text"
              placeholder="请输入债务总额"
              {...register("totalDebt")}
              onChange={(e) => handleNumberInputChange(e, "totalDebt")}
            />
            {numberInputErrors.totalDebt && <p className="text-red-500 text-sm">{numberInputErrors.totalDebt}</p>}
            {errors.totalDebt && !numberInputErrors.totalDebt && (
              <p className="text-red-500 text-sm">{errors.totalDebt.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium">
              问题6：请列出贵企业的主要债务情况，包括债务类别、具体金额、是否计息等。
            </label>

            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%] md:w-[25%]">债务类别</TableHead>
                    <TableHead className="w-[20%] md:w-[20%]">具体金额（万元）</TableHead>
                    <TableHead className="w-[15%] md:w-[15%]">是否计息</TableHead>
                    <TableHead className="w-[30%] md:w-[35%]">其他信息</TableHead>
                    <TableHead className="w-[5%] md:w-[5%]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debtFields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell className="p-2">
                        <select
                          {...register(`debtItems.${index}.type`)}
                          className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                        >
                          <option value="">选择债务类别</option>
                          {debtTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        {errors.debtItems?.[index]?.type && (
                          <p className="text-red-500 text-xs mt-1">{errors.debtItems[index]?.type?.message}</p>
                        )}
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          type="text"
                          placeholder="金额"
                          className="text-sm px-2 py-1 h-auto"
                          {...register(`debtItems.${index}.amount`)}
                          onChange={(e) => handleNumberInputChange(e, `debtItems.${index}.amount`)}
                        />
                        {numberInputErrors[`debtItems.${index}.amount`] && (
                          <p className="text-red-500 text-xs mt-1">{numberInputErrors[`debtItems.${index}.amount`]}</p>
                        )}
                        {errors.debtItems?.[index]?.amount && !numberInputErrors[`debtItems.${index}.amount`] && (
                          <p className="text-red-500 text-xs mt-1">{errors.debtItems[index]?.amount?.message}</p>
                        )}
                      </TableCell>
                      <TableCell className="p-2">
                        <select
                          {...register(`debtItems.${index}.hasInterest`)}
                          className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                        >
                          <option value="是">是</option>
                          <option value="否">否</option>
                        </select>

                        {watch(`debtItems.${index}.hasInterest`) === "是" && (
                          <div className="mt-2">
                            <label className="block text-xs font-medium mb-1">计息类别</label>
                            <select
                              {...register(`debtItems.${index}.interestType`)}
                              className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                            >
                              <option value="">请选择</option>
                              <option value="等额本息">等额本息</option>
                              <option value="等本等息">等本等息</option>
                              <option value="等额本金">等额本金</option>
                              <option value="先息后本">先息后本</option>
                            </select>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="p-2">
                        <div>
                          <label className="block text-xs font-medium mb-1">抵押物类型</label>
                          <select
                            {...register(`debtItems.${index}.mortgageAssetType`)}
                            className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                          >
                            <option value="">请选择</option>
                            <option value="无抵押">无抵押</option>
                            <option value="个人资产">个人资产</option>
                            <option value="企业资产">企业资产</option>
                          </select>
                        </div>

                        {watch(`debtItems.${index}.type`) === "民间借贷" && (
                          <div className="mt-2">
                            <label className="block text-xs font-medium mb-1">借贷来源</label>
                            <select
                              {...register(`debtItems.${index}.loanSource`)}
                              className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                            >
                              <option value="">请选择</option>
                              <option value="个人">个人</option>
                              <option value="高利贷">高利贷</option>
                              <option value="小额贷">小额贷</option>
                            </select>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="p-1 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => debtFields.length > 1 && removeDebt(index)}
                          disabled={debtFields.length <= 1}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendDebt({ type: "", amount: "", hasInterest: "否", interestType: "" })}
            className="flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" /> 添加债务项
          </Button>

          {errors.debtItems && !Array.isArray(errors.debtItems) && (
            <p className="text-red-500 text-sm">{errors.debtItems.message}</p>
          )}
          <div className="space-y-2 mt-6">
            <label className="block text-sm font-medium">问题7：目前这些债务中，是否有被起诉的？如有，请列出。</label>
            <Textarea
              placeholder="请详细描述被起诉的债务情况"
              className="min-h-[100px]"
              {...register("lawsuitDebts")}
            />
          </div>

          <div className="space-y-2 mt-6">
            <label className="block text-sm font-medium">问题8：是否有债务已进入执行阶段？</label>
            <div className="space-y-2">
              {["是", "否"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`inExecution-${option}`}
                    value={option}
                    {...register("inExecution")}
                    className="h-4 w-4"
                  />
                  <label htmlFor={`inExecution-${option}`} className="text-sm">
                    {option}
                  </label>
                </div>
              ))}
            </div>
            {errors.inExecution && <p className="text-red-500 text-sm">{errors.inExecution.message}</p>}
          </div>

          {watch("inExecution") === "是" && (
            <div className="space-y-2 mt-2">
              <label className="block text-sm font-medium">请说明查封、拍卖情况</label>
              <Textarea
                placeholder="请详细描述查封、拍卖情况"
                className="min-h-[100px]"
                {...register("executionDetails")}
              />
            </div>
          )}

          <div className="space-y-2 mt-6">
            <label className="block text-sm font-medium">问题9：债务是否全部为企业债务？有无连带到您个人？</label>
            <div className="space-y-2">
              {["全部为企业债务", "有连带个人债务"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`personalDebt-${option}`}
                    value={option}
                    {...register("personalDebt")}
                    className="h-4 w-4"
                  />
                  <label htmlFor={`personalDebt-${option}`} className="text-sm">
                    {option}
                  </label>
                </div>
              ))}
            </div>
            {errors.personalDebt && <p className="text-red-500 text-sm">{errors.personalDebt.message}</p>}
          </div>

          {watch("personalDebt") === "有连带个人债务" && (
            <div className="space-y-2 mt-2">
              <label className="block text-sm font-medium">连带个人债务金额（万元）</label>
              <Input
                type="text"
                placeholder="请输入连带个人债务金额"
                {...register("personalDebtAmount")}
                onChange={(e) => handleNumberInputChange(e, "personalDebtAmount")}
              />
              {numberInputErrors.personalDebtAmount && (
                <p className="text-red-500 text-sm">{numberInputErrors.personalDebtAmount}</p>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "资产情况",
      fields: (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">3. 资产情况</h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium">问题10：请问贵企业名下的资产总额是多少？（单位：万元）</label>
            <Input
              type="text"
              placeholder="请输入资产总额"
              {...register("totalAsset")}
              onChange={(e) => handleNumberInputChange(e, "totalAsset")}
            />
            {numberInputErrors.totalAsset && <p className="text-red-500 text-sm">{numberInputErrors.totalAsset}</p>}
            {errors.totalAsset && !numberInputErrors.totalAsset && (
              <p className="text-red-500 text-sm">{errors.totalAsset.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium">
              问题11：请列出贵企业的主要资产情况，包括资产类别、数量、金额等。
            </label>

            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%] md:w-[35%]">资产类别</TableHead>
                    <TableHead className="w-[25%] md:w-[25%]">数量</TableHead>
                    <TableHead className="w-[30%] md:w-[35%]">金额（万元）</TableHead>
                    <TableHead className="w-[5%] md:w-[5%]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assetFields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell className="p-2">
                        <select
                          {...register(`assetItems.${index}.type`)}
                          className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                        >
                          <option value="">选择资产类别</option>
                          {assetTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        {errors.assetItems?.[index]?.type && (
                          <p className="text-red-500 text-xs mt-1">{errors.assetItems[index]?.type?.message}</p>
                        )}
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          placeholder="数量（可填写数字或文字）"
                          className="text-sm px-2 py-1 h-auto"
                          {...register(`assetItems.${index}.quantity`)}
                        />
                        {errors.assetItems?.[index]?.quantity && (
                          <p className="text-red-500 text-xs mt-1">{errors.assetItems[index]?.quantity?.message}</p>
                        )}
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          type="text"
                          placeholder="金额"
                          className="text-sm px-2 py-1 h-auto"
                          {...register(`assetItems.${index}.amount`)}
                          onChange={(e) => handleNumberInputChange(e, `assetItems.${index}.amount`)}
                        />
                        {numberInputErrors[`assetItems.${index}.amount`] && (
                          <p className="text-red-500 text-xs mt-1">{numberInputErrors[`assetItems.${index}.amount`]}</p>
                        )}
                        {errors.assetItems?.[index]?.amount && !numberInputErrors[`assetItems.${index}.amount`] && (
                          <p className="text-red-500 text-xs mt-1">{errors.assetItems[index]?.amount?.message}</p>
                        )}
                      </TableCell>
                      <TableCell className="p-1 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => assetFields.length > 1 && removeAsset(index)}
                          disabled={assetFields.length <= 1}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendAsset({ type: "", quantity: "", amount: "" })}
            className="flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" /> 添加资产项
          </Button>

          {errors.assetItems && !Array.isArray(errors.assetItems) && (
            <p className="text-red-500 text-sm">{errors.assetItems.message}</p>
          )}
        </div>
      ),
    },
    {
      title: "客户诉求",
      fields: (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">4. 客户诉求</h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium">问题12：您目前是否还想继续经营企业？</label>
            <div className="space-y-2">
              {["是", "否"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`continueBusiness-${option}`}
                    value={option}
                    {...register("continueBusiness")}
                    className="h-4 w-4"
                  />
                  <label htmlFor={`continueBusiness-${option}`} className="text-sm">
                    {option}
                  </label>
                </div>
              ))}
            </div>
            {errors.continueBusiness && <p className="text-red-500 text-sm">{errors.continueBusiness.message}</p>}
          </div>

          {watch("continueBusiness") === "是" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">问题13：请说明您主要想要解决的问题是什么？</label>
              <Textarea
                placeholder="请详细描述您想要解决的问题"
                className="min-h-[100px]"
                {...register("problemsToSolve")}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      title: "清算与实缴情况",
      fields: (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">5. 清算与实缴情况</h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              问题14：请问贵公司的注册资本是否已完成实缴？（重整无需实缴完成）
            </label>
            <div className="space-y-2">
              {["已完成实缴（包括部分完成）", "未完成实缴"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`capitalPaid-${option}`}
                    value={option}
                    {...register("capitalPaid")}
                    className="h-4 w-4"
                  />
                  <label htmlFor={`capitalPaid-${option}`} className="text-sm">
                    {option}
                  </label>
                </div>
              ))}
            </div>
            {errors.capitalPaid && <p className="text-red-500 text-sm">{errors.capitalPaid.message}</p>}
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium">
              问题15：请填写注册资本{watch("capitalPaid") === "已完成实缴（包括部分完成）" ? "及实缴金额" : ""}
              、注册时间。
            </label>

            <div className="space-y-2">
              <label className="block text-sm font-medium">注册资本（万元）</label>
              <Input
                type="text"
                placeholder="请输入注册资本"
                {...register("registeredCapital")}
                onChange={(e) => handleNumberInputChange(e, "registeredCapital")}
              />
              {numberInputErrors.registeredCapital && (
                <p className="text-red-500 text-sm">{numberInputErrors.registeredCapital}</p>
              )}
            </div>

            {watch("capitalPaid") === "已完成实缴（包括部分完成）" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium">实缴金额（万元）</label>
                <Input
                  type="text"
                  placeholder="请输入实缴金额"
                  {...register("paidCapital")}
                  onChange={(e) => handleNumberInputChange(e, "paidCapital")}
                />
                {numberInputErrors.paidCapital && (
                  <p className="text-red-500 text-sm">{numberInputErrors.paidCapital}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium">注册时间</label>
              <Input type="date" max={currentDate} {...register("registrationDate")} />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "支付能力",
      fields: (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">6. 支付能力</h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium">问题15：目前企业是否还在经营？</label>
            <div className="space-y-2">
              {["是", "否"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`stillOperating-${option}`}
                    value={option}
                    {...register("stillOperating")}
                    className="h-4 w-4"
                  />
                  <label htmlFor={`stillOperating-${option}`} className="text-sm">
                    {option}
                  </label>
                </div>
              ))}
            </div>
            {errors.stillOperating && <p className="text-red-500 text-sm">{errors.stillOperating.message}</p>}
          </div>

          {watch("stillOperating") === "是" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">问题16：请说明目前在经营的企业还有多少员工。</label>
              <Input
                type="text"
                placeholder="请输入员工数量"
                {...register("employeeCount")}
                onChange={(e) => handleNumberInputChange(e, "employeeCount")}
              />
              {numberInputErrors.employeeCount && (
                <p className="text-red-500 text-sm">{numberInputErrors.employeeCount}</p>
              )}
            </div>
          )}

          {watch("stillOperating") === "否" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">问题17：请说明企业停止经营多久了。</label>
              <Input placeholder="例如：6个月、2年等" {...register("stopOperatingTime")} />
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium">问题18：贵企业是否还有其他业务在经营？</label>
            <div className="space-y-2">
              {["是", "否"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`otherBusiness-${option}`}
                    value={option}
                    {...register("otherBusiness")}
                    className="h-4 w-4"
                  />
                  <label htmlFor={`otherBusiness-${option}`} className="text-sm">
                    {option}
                  </label>
                </div>
              ))}
            </div>
            {errors.otherBusiness && <p className="text-red-500 text-sm">{errors.otherBusiness.message}</p>}
          </div>

          {watch("otherBusiness") === "是" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">请说明经营的是什么</label>
              <Textarea
                placeholder="请详细描述经营内容"
                className="min-h-[100px]"
                {...register("otherBusinessContent")}
              />
            </div>
          )}
        </div>
      ),
    },
  ]

  const progress = ((currentSection + 1) / sections.length) * 100

  if (isSubmitted && submittedData) {
    return <SuccessView formData={submittedData} onEdit={handleEdit} />
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="bg-gray-100 border-b">
        <CardTitle className="text-2xl text-center text-gray-800">企业财务状况调研问卷</CardTitle>
        <CardDescription className="text-center text-gray-600 mt-2">
          尊敬的受访者，为了更好地了解您的企业财务状况，并为您提供针对性的解决方案，我们特此开展本次调研。
          请您根据企业实际情况，如实填写以下问卷。您的信息将仅用于本次调研分析，我们承诺严格保密。
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>
              第 {currentSection + 1} 部分，共 {sections.length} 部分
            </span>
            <span>{sections[currentSection].title}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {sections[currentSection].fields}

          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevSection}
              disabled={currentSection === 0}
              className="flex items-center"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> 上一步
            </Button>

            {currentSection < sections.length - 1 ? (
              <Button type="button" onClick={nextSection} className="flex items-center">
                下一步 <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={handleFormSubmit}>
                提交问卷
              </Button>
            )}
          </div>
        </form>
      </CardContent>

      {/* 错误提示对话框 */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-amber-600">
              <AlertTriangle className="h-5 w-5 mr-2" /> 表单填写有误
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="mt-2 text-left">
                <div className="mb-2">以下信息未填写或填写有误：</div>
                <ul className="list-disc pl-5 space-y-1 max-h-60 overflow-y-auto">
                  {formErrors.map((error, index) => (
                    <li key={index} className="text-sm text-red-600">
                      {error}
                    </li>
                  ))}
                </ul>
                <div className="mt-4">是否返回修改？如选择"否"，将忽略错误直接提交。</div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleIgnoreAndSubmit}>否，直接提交</AlertDialogCancel>
            <AlertDialogAction onClick={handleReturnToEdit}>是，返回修改</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
