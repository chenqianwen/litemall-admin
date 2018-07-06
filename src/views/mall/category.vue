<template>
  <div class="app-container calendar-list-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input clearable class="filter-item" style="width: 200px;" placeholder="请输入类目ID" v-model="listQuery.id">
      </el-input>
      <el-input clearable class="filter-item" style="width: 200px;" placeholder="请输入类目名称" v-model="listQuery.name">
      </el-input>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button class="filter-item" type="primary" @click="handleCreate" icon="el-icon-edit">添加</el-button>
      <el-button class="filter-item" type="primary" :loading="downloadLoading" v-waves icon="el-icon-download" @click="handleDownload">导出</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table size="small" :data="list" v-loading="listLoading" element-loading-text="正在查询中。。。" border fit highlight-current-row>

      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" class="demo-table-expand">
            <el-form-item label="首页页面类目图标">
       				<img :src="props.row.iconUrl">
            </el-form-item>
            <el-form-item label="首页页面类目横幅图片">
       				<img :src="props.row.bannerUrl">
            </el-form-item>
            <el-form-item label="类目页标题">
              <span>{{ props.row.frontName }}</span>
            </el-form-item>
            <el-form-item label="类目页介绍">
              <span>{{ props.row.frontDesc }}</span>
            </el-form-item>
            <el-form-item label="类目页横幅">
       				<img :src="props.row.wapBannerUrl">
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>

      <el-table-column align="center" width="100px" label="类目ID" prop="id" sortable>
      </el-table-column>

      <el-table-column align="center" min-width="100px" label="名称" prop="name">
      </el-table-column>

      <el-table-column align="center" min-width="100px" label="关键字" prop="keywords">
      </el-table-column>

      <el-table-column align="center" min-width="100px" label="级别" prop="level"
        :filters="[{ text: '一级类目', value: 'L1' }, { text: '二级类目', value: 'L2' }]" :filter-method="filterLevel">
        <template slot-scope="scope">
          <el-tag :type="scope.row.level === 'L1' ? 'primary' : 'info' ">{{scope.row.level === 'L1' ? '一级类目' : '二级类目'}}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" min-width="100px" label="父类目ID" prop="parentId">
      </el-table-column>

      <el-table-column align="center" label="排序" prop="sort">
      </el-table-column>

      <el-table-column align="center" min-width="100px" label="是否显示" prop="isShow">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isShow ? 'success' : 'error' ">{{scope.row.isShow ? '可显示' : '不显示'}}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="250" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini"  @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.page"
        :page-sizes="[10,20,50,100,200]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <!-- 添加或修改对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-dialog
        width="50%"
        title="放大图"
        :visible.sync="dialogVisible"
        append-to-body>
        <img width="100%" :src="dialogImageUrl" alt="">
      </el-dialog>
      <el-form :rules="rules" ref="dataForm" :model="dataForm" status-icon label-position="left" label-width="100px" style='width: 600px; margin-left:50px;'>
        <el-form-item label="类目名称" prop="name">
          <el-input v-model="dataForm.name"></el-input>
        </el-form-item>
        <el-form-item label="类目关键字" prop="keywords">
          <el-input v-model="dataForm.keywords"></el-input>
        </el-form-item>
        <el-form-item label="类目级别" prop="level">
          <el-select v-model="dataForm.level" placeholder="请选择">
            <el-option label="一级类目" value="L1">
            </el-option>
            <el-option label="二级类目" value="L2">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="父类目" prop="parentId" v-if="dataForm.level === 'L2'">
          <el-select v-model="dataForm.parentId" placeholder="请选择">
            <el-option v-for="(key, val) in catL1" :key="key" :label="key" :value="val">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="类目页横幅" prop="wapBannerUrl">
          <el-upload
            action="#"
            :limit="1"
            list-type="picture-card"
            :on-exceed="wapBannerHandleExceed"
            :http-request="wapBannerUpload"
            :on-preview="handlePictureCardPreview"
            :on-remove="wapBannerHandleRemove"
            :on-success="handleWapBannerUrl"
            :file-list="wapBannerList">
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="图标" prop="iconUrl">
          <el-upload
            action="#"
            :limit="1"
            list-type="picture-card"
            :on-exceed="iconUrlHandleExceed"
            :http-request="iconUrlUpload"
            :on-preview="handlePictureCardPreview"
            :on-remove="iconUrlHandleRemove"
            :on-success="handleIconUrl"
            :file-list="iconUrlList">
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="首页横幅" prop="bannerUrl">
          <el-upload
            action="#"
            :limit="1"
            list-type="picture-card"
            :on-exceed="bannerUrlHandleExceed"
            :http-request="bannerUrlUpload"
            :on-preview="handlePictureCardPreview"
            :on-remove="bannerUrlHandleRemove"
            :on-success="handleBannerUrl"
            :file-list="bannerUrlList">
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
          <el-form-item label="类目页标题" prop="frontName">
          <el-input v-model="dataForm.frontName"></el-input>
        </el-form-item>
        <el-form-item label="类目页介绍" prop="frontDesc">
          <el-input v-model="dataForm.frontDesc"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="frontDesc">
          <el-input v-model="dataForm.sort"></el-input>
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

<style>
  .demo-table-expand {
    font-size: 0;
  }
  .demo-table-expand label {
    width: 200px;
    color: #99a9bf;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
  }
</style>

<script>
import { listCategory, listCatL1, createCategory, updateCategory, deleteCategory } from '@/api/category'
import waves from '@/directive/waves' // 水波纹指令
import {createStorage, uploadFile, deleteFile} from '@/api/storage'

export default {
  name: 'Category',
  directives: {
    waves
  },
  data() {
    return {
      list: undefined,
      total: undefined,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        id: undefined,
        name: undefined,
        sort: '+id'
      },
      catL1: {},
      dataForm: {
        id: undefined,
        name: '',
        keywords: '',
        level: 'L1',
        parentId: '',
        isShow: 'true',
        frontName: '',
        frontDesc: '',
        iconUrl: undefined,
        bannerUrl: undefined,
        wapBannerUrl: undefined,
        sort: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        name: [{ required: true, message: '类目名称不能为空', trigger: 'blur' }],
        keyword: [{ required: true, message: '类目关键字不能为空', trigger: 'blur' }]
      },
      downloadLoading: false,
      iconUrlList: [],
      bannerUrlList: [],
      wapBannerList: [],
      dialogImageUrl: '',
      dialogVisible: false
    }
  },
  created() {
    this.getList()
    this.getCatL1()
  },
  methods: {
    getList() {
      this.listLoading = true
      listCategory(this.listQuery).then(response => {
        this.list = response.data.data.items
        this.total = response.data.data.total
        this.listLoading = false
      }).catch(() => {
        this.list = []
        this.total = 0
        this.listLoading = false
      })
    },
    getCatL1() {
      listCatL1().then(response => {
          this.catL1 = response.data.data
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
        id: undefined,
        name: '',
        keyword: '',
        level: 'L1',
        parentId: '',
        isShow: 'true',
        frontName: '',
        frontDesc: '',
        iconUrl: undefined,
        bannerUrl: undefined,
        wapBannerUrl: undefined
      }
      this.iconUrlList = []
      this.bannerUrlList = []
      this.wapBannerList = []
    },
    filterLevel(value, row) {
      return row.level === value
    },
    handleCreate() {
      this.resetForm()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleIconUrl(response, file, fileList) {
      if (response.errcode === 0) {
        this.dataForm.iconUrl = response.data.data
      }
    },
    handleBannerUrl(response, file, fileList) {
      if (response.errcode === 0) {
        this.dataForm.bannerUrl = response.data.data
      }
    },
    handleWapBannerUrl(response, file, fileList) {
      if (response.errcode === 0) {
        this.dataForm.wapBannerUrl = response.data.data
      }
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createCategory(this.dataForm).then(response => {
            this.list.unshift(response.data.data)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
            this.getCatL1()
          })
        }
      })
    },
    handleUpdate(row) {
      this.dataForm = Object.assign({}, row)
      this.iconUrlList = [{url: row.iconUrl}]
      this.bannerUrlList = [{url: row.bannerUrl}]
      this.wapBannerList = [{url: row.wapBannerUrl}]
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateCategory(this.dataForm).then(() => {
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
            this.getCatL1()
          })
        }
      })
    },
    handleDelete(row) {
      deleteCategory(row).then(response => {
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
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['类目ID', '名称', '关键字', '级别', '父类目ID', '是否显示', '图标', '首页横幅', '类目页标题', '类目页介绍', '类目页横幅']
        const filterVal = ['id', 'name', 'keyword', 'level', 'parentId', 'isShow', 'iconUrl', 'bannerUrl', 'frontName', 'frontDesc', 'wapBannerUrl']
        excel.export_json_to_excel2(tHeader, this.list, filterVal, '商品类目信息')
        this.downloadLoading = false
      })
    },
    iconUrlHandleExceed(files, fileList) {
      this.$message.warning(`当前最多选择 1 个文件`);
    },
    iconUrlUpload(item) {
      const formData = new FormData()
      formData.append('file', item.file)
      uploadFile(formData, (res) => {
        this.dataForm.iconUrl = res
        this.$notify({
          title: '成功',
          message: '上传',
          type: 'success',
          duration: 2000
        })
      })
    },
    iconUrlHandleRemove(file, fileList) {
      let url = file.url
      deleteFile(url, (res) => {
        this.dataForm.iconUrl = ''
        this.$notify({
          title: '成功',
          message: '删除',
          type: 'success',
          duration: 2000
        })
      })
      console.log(JSON.stringify(file));
      console.log(JSON.stringify(fileList));
    },
    bannerUrlHandleExceed(files, fileList) {
      this.$message.warning(`当前最多选择 1 个文件`);
    },
    bannerUrlUpload(item) {
      const formData = new FormData()
      formData.append('file', item.file)
      uploadFile(formData, (res) => {
        console.log(res)
        this.dataForm.bannerUrl = res
        this.$notify({
          title: '成功',
          message: '上传',
          type: 'success',
          duration: 2000
        })
      })
    },
    bannerUrlHandleRemove(file, fileList) {
      let url = file.url
      deleteFile(url, (res) => {
        this.dataForm.bannerUrl = ''
        this.$notify({
          title: '成功',
          message: '删除',
          type: 'success',
          duration: 2000
        })
      })
      console.log(JSON.stringify(file));
      console.log(JSON.stringify(fileList));
    },
    wapBannerHandleExceed(files, fileList) {
      this.$message.warning(`当前最多选择 1 个文件`);
    },
    wapBannerUpload(item) {
      const formData = new FormData()
      formData.append('file', item.file)
      uploadFile(formData, (res) => {
        console.log(res)
        this.dataForm.wapBannerUrl = res
        this.$notify({
          title: '成功',
          message: '上传',
          type: 'success',
          duration: 2000
        })
      })
    },
    wapBannerHandleRemove(file, fileList) {
      let url = file.url
      deleteFile(url, (res) => {
        this.dataForm.wapBannerUrl = ''
        this.$notify({
          title: '成功',
          message: '删除',
          type: 'success',
          duration: 2000
        })
      })
      console.log(JSON.stringify(file));
      console.log(JSON.stringify(fileList));
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    }
  }
}
</script>
