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

      <el-table-column align="center" min-width="100px" label="优惠券名称" prop="couponName">
      </el-table-column>

      <el-table-column align="center" min-width="100px" label="优惠券总数量" prop="totalNumber">
      </el-table-column>

      <el-table-column align="center" min-width="100px" label="活动开始时间" prop="startTime" value-format="yyyy-MM-dd">
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
      <el-form ref="dataForm" :model="dataForm" status-icon label-position="left" label-width="100px"
               style='width: 80%; margin-left:50px;'>
        <el-form-item label="选择优惠券" prop="couponId">
          <el-select ref="couponRef" v-model="dataForm.couponId" placeholder="请选择"  style='width: 100%' ></el-select>
        </el-form-item>
        </el-form-item>
          <el-input v-model="dataForm.totalNumber" style='width: 100%'></el-input>
        </el-form-item>
         <el-form-item label="活动开始时间" prop="startTime">
          <el-date-picker v-model="dataForm.startTime" type="datetime" placeholder="选择日期"
                         cff style='width: 100%'>b
          </el-date-picker>
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
  import {getValidCoupon} from '@/api/coupon'
  import {listCouponKill,createCouponKill,updateCouponKill,deleteCouponKill} from '@/api/couponKill'
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
        listLoading: false,
        listQuery: {
          page: 1,
          limit: 20,
          userId: undefined,
          keyword: undefined,
          sort: '+id'
        },
        dataForm: {
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        downloadLoading: false,
        // 优惠券的列表
        couponList: []
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true
        listCouponKill(this.listQuery).then(response => {
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
        this.getCouponList()
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
        console.log(this.$refs.couponRef.selectedLabel)
        let result = this.validFom()
        if (result) {
          this.$refs['dataForm'].validate(valid => {
            result = valid
          })
        }
        // 验证通过之后
        if (result) {
          this.dataForm.couponName =this.$refs.couponRef.selectedLabel
          createCouponKill(this.dataForm).then(response => {
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
      // 获得优惠券的列表
      getCouponList() {
        getValidCoupon().then(res => {
          this.couponList = res.data.data
        })
      },
      handleUpdate(row) {
        this.beforeHandle()
        this.dataForm = Object.assign({}, row)
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      updateData() {
        this.$refs['dataForm'].validate(valid => {
          if (valid) {
            updateCouponKill(this.dataForm).then(() => {
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
        console.log(row)
        deleteCouponKill(row).then(response => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          const index = this.list.indexOf(row)
          this.list.splice(index, 1)
        })
      }
    }
  }
</script>
