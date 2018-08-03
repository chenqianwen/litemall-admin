<template>
  <div class="app-container calendar-list-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input clearable class="filter-item" style="width: 200px;" placeholder="请输入搜索名称关键字" v-model="listQuery.name">
      </el-input>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button class="filter-item" type="primary" @click="handleCreate" icon="el-icon-edit">添加</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table size="small" :data="list" v-loading="listLoading" element-loading-text="正在查询中。。。" border fit
              highlight-current-row>

      <el-table-column align="center" min-width="100px" label="名称" prop="name">
      </el-table-column>

      <el-table-column align="center" min-width="100px" label="详情" prop="detail">
      </el-table-column>

      <el-table-column align="center" min-width="100px" label="有效期" prop="validTime">
      </el-table-column>

      <el-table-column align="center" label="操作" width="250" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="listQuery.page" :page-sizes="[10,20,30,50]" :page-size="listQuery.limit"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <!-- 添加或修改对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" ref="dataForm" :model="dataForm" status-icon label-position="left" label-width="100px"
               style='width: 80%; margin-left:50px;'>
        <el-form-item label="优惠券名称" prop="name">
          <el-input v-model="dataForm.name"></el-input>
        </el-form-item>
        <el-form-item label="优惠券详情" prop="detail">
          <el-input v-model="dataForm.detail"></el-input>
        </el-form-item>
        <el-form-item label="有效期至" prop="validTime">
          <el-date-picker v-model="dataForm.validTime" type="date" placeholder="选择日期" value-format="yyyy-MM-dd"
                          style='width: 100%'>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="可用范围" prop="ranges">
          <el-select v-model="dataForm.ranges" placeholder="请选择" @change="changeRange" clearable style='width: 100%'>
            <el-option
              v-for="item in rangeList"
              :key="item.value"
              :label="item.text"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form v-show="showCatForm" :model="catForm" ref="catForm" class="demo-ruleForm" status-icon
                 label-position="left" label-width="100px" style='width: 100%;'>
          <el-form-item label="二级分类" prop="catIds"
                        :rules="[{type:'array',required: true,message: '请至少选择一个',trigger: 'change'}]">
            <el-select v-model="catForm.catIds" multiple placeholder="请选择" clearable style='width: 100%'>
              <el-option
                v-for="item in catL2List"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <el-form-item label="优惠卷类型" prop="type">
          <el-select v-model="dataForm.type" placeholder="请选择" @change="changeType" clearable style='width: 100%;'>
            <el-option
              v-for="item in typeList"
              :key="item.value"
              :label="item.text"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-form v-show="showReduceForm" :model="reduceForm" ref="reduceForm" :inline="true" class="demo-form-inline"
               status-icon label-position="left" style='margin-left:50px;'>
        <el-form-item label="满" prop="reachMoney" :rules="[{ required: true, message: '不能为空', trigger: 'blur' }]">
          <el-input v-model.number="reduceForm.reachMoney"></el-input>
        </el-form-item>
        <el-form-item label="减" prop="reduceMoney" :rules="[{ required: true, message: '不能为空', trigger: 'blur' }]">
          <el-input v-model.number="reduceForm.reduceMoney"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确定</el-button>
        <el-button v-else type="primary" @click="updateData">确定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import {listCoupon, createCoupon, updateCoupon, deleteCoupon, getCouponRange, getCouponType} from '@/api/coupon'
  import {listCatL2} from '@/api/category'
  import waves from '@/directive/waves' // 水波纹指令

  export default {
    name: 'History',
    directives: {
      waves
    },
    data() {
      return {
        list: null,
        total: null,
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 20,
          userId: undefined,
          keyword: undefined,
          sort: '+id'
        },
        dataForm: {
          id: undefined,
          name: '',
          detail: '',
          validTime: undefined,
          ranges: '',
          type: ''
        },
        // 分类表单
        catForm: {
          catIds: []
        },
        // 满减表单：
        reduceForm: {
          reachMoney: '',
          reduceMoney: ''
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        // 可用范围：
        rangeList: [],
        // 可用类型：
        typeList: [],
        // 二级分类的数据
        catL2List: [],
        rules: {
          name: [
            {required: true, message: '名称不能为空', trigger: 'blur'}
          ],
          detail: [
            {required: true, message: '详情不能为空', trigger: 'blur'}
          ],
          validTime: [
            {required: true, message: '有效期不能为空', trigger: 'blur'}
          ],
          ranges: [
            {required: true, message: '可用范围不能为空', trigger: 'change'}
          ],
          type: [
            {required: true, message: '类型不能为空', trigger: 'change'}
          ]
        },
        downloadLoading: false,
        // 是否显示二级分类的逼到
        showCatForm: false,
        // 是否显示满减的表单
        showReduceForm: false,
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true
        listCoupon(this.listQuery).then(response => {
          this.list = response.data.data.items
          this.total = response.data.data.total
          this.listLoading = false
        }).catch(() => {
          this.list = []
          this.total = 0
          this.listLoading = false
        })
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
      handleSizeChange(val) {
        this.listQuery.limit = val
        this.getList()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.getList()
      },
      resetForm() {
        this.dataForm = {
          id: undefined
        }
      },
      beforeHandle() {
        this.getCouponRange()
        this.getCouponType()
      },
      handleCreate() {
        this.resetForm()
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.beforeHandle()
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      createData() {
        let result = this.validFom()
        if (result) {
          this.$refs['dataForm'].validate(valid => {
            result = valid
          })
        }
        // 验证通过之后
        if (result) {
          this.dataForm.catIds = JSON.stringify(this.catForm.catIds)
          this.dataForm.reachMoney = this.reduceForm.reachMoney
          this.dataForm.reduceMoney = this.reduceForm.reduceMoney
          createCoupon(this.dataForm).then(response => {
            this.dialogFormVisible = false
            this.getList()
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      },
      // 验证表单数据
      validFom() {
        let result = true
        // 验证二级分类表单
        if (this.showCatForm) {
          this.$refs['catForm'].validate(valid => {
            if (!valid) {
              result = false
            }
          })
        }
        // 验证满减表单
        if (this.showReduceForm) {
          this.$refs['reduceForm'].validate(valid => {
            if (!valid) {
              result = false
            }
          })
        }
        return result
      },
      // 选择优惠券可用范围
      changeRange(val) {
        // 选择二级分类
        if (val === 2) {
          this.showCatForm = true
          this.listCatL2()
        } else {
          this.showCatForm = false
        }
      },
      // 选择优惠券类型
      changeType(val) {
        // 满减
        if (val === 0) {
          this.showReduceForm = true
        } else {
          this.showReduceForm = false
        }
      },
      handleUpdate(row) {
        this.beforeHandle()
        this.dataForm = Object.assign({}, row)
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
        // 判断是否显示其他表单
        if (this.dataForm.ranges === 2) {
          this.showCatForm = true
          this.listCatL2()
          this.catForm.catIds = JSON.parse(this.dataForm.catIds)
        } else {
          this.showCatForm = false
        }
        if (this.dataForm.type === 0) {
          this.showReduceForm = true
          this.reduceForm.reachMoney = this.dataForm.reachMoney
          this.reduceForm.reduceMoney = this.dataForm.reduceMoney
        } else {
          this.showReduceForm = false
        }
      },
      updateData() {
        this.$refs['dataForm'].validate(valid => {
          if (valid) {
            updateCoupon(this.dataForm).then(() => {
              for (const v of this.list) {
                if (v.id === this.dataForm.id) {
                  const index = this.list.indexOf(v)
                  this.list.splice(index, 1, this.dataForm)
                  break
                }
              }
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },
      handleDelete(row) {
        deleteCoupon(row).then(response => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          const index = this.list.indexOf(row)
          this.list.splice(index, 1)
        })
      },
      getCouponRange() {
        getCouponRange().then(res => {
          this.rangeList = res.data.data
        }).catch(() => {
        })
      },
      getCouponType() {
        getCouponType().then(res => {
          this.typeList = res.data.data
        }).catch(() => {
        })
      },
      listCatL2() {
        listCatL2().then(res => {
          console.log(res)
          this.catL2List = res.data.data
        }).catch(() => {
        })
      }
    }
  }
</script>
